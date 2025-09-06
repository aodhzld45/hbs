// src/features/Kis/services/kisApi.ts
// axios 기반 / TTL 메모리 캐시 / AbortController 지원 / inflight 병합 / HTML 응답 가드

import api from '../../../../services/api';
import type { KisSearch, StockLite } from '../types';

/* ------------------------------------------------------------------ *
 * Config
 * ------------------------------------------------------------------ */
const TTL = {
  kisPrice: 3000,
  kisHist: 5000,
  kisSearch: 15_000,
  stocksSearch: 15_000,
  stocksResolve: 30_000,
} as const;

/* ------------------------------------------------------------------ *
 * Cache (TTL)
 * ------------------------------------------------------------------ */
const memoryCache = new Map<string, { exp: number; data: any }>();
const now = () => Date.now();

function getCache<T>(key: string): T | null {
  const hit = memoryCache.get(key);
  if (!hit) return null;
  if (hit.exp < now()) {
    memoryCache.delete(key);
    return null;
  }
  return hit.data as T;
}
function setCache(key: string, data: any, ttlMs: number) {
  if (ttlMs <= 0) return;
  memoryCache.set(key, { exp: now() + ttlMs, data });
}
export function clearKisApiCache(prefix?: string) {
  if (!prefix) return memoryCache.clear();
  Array.from(memoryCache.keys()).forEach(k => { if (k.startsWith(prefix)) memoryCache.delete(k); });
}

/* ------------------------------------------------------------------ *
 * Inflight dedup
 * ------------------------------------------------------------------ */
const inflight = new Map<string, Promise<any>>();
async function once<T>(key: string, factory: () => Promise<T>): Promise<T> {
  const hit = inflight.get(key);
  if (hit) return hit as Promise<T>;
  const p = factory().finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

/* ------------------------------------------------------------------ *
 * Error helpers
 * ------------------------------------------------------------------ */
export function isCanceledError(e: any) {
  const msg = String(e?.message || '').toLowerCase();
  return (
    e?.code === 'ERR_CANCELED' ||
    e?.name === 'CanceledError' ||
    e?.name === 'AbortError' ||
    msg.includes('canceled') ||
    msg.includes('cancelled') ||
    msg.includes('abort')
  );
}
function buildAxiosError(path: string, e: any): Error {
  if (isCanceledError(e)) return e; // 취소는 그대로 던져 상위에서 무시
  const status = e?.response?.status;
  const body = typeof e?.response?.data === 'string'
    ? e.response.data
    : JSON.stringify(e?.response?.data || {});
  return new Error(`[KIS GET ${path}] ${status ?? ''} ${e?.message || ''}\n${body.slice(0, 200)}`);
}

/* ------------------------------------------------------------------ *
 * HTTP (axios.get wrapper with HTML guard)
 * ------------------------------------------------------------------ */
async function getJSON<T>(
  path: string,
  params?: Record<string, any>,
  signal?: AbortSignal
): Promise<T> {
  try {
    const res = await api.get(path, {
      params,
      signal,
      responseType: 'json',
      transformResponse: [
        (data, headers) => {
          const ct = String(headers?.['content-type'] || headers?.['Content-Type'] || '');
          if (typeof data === 'string') {
            // HTML이 오면 프록시/BASE_URL 설정 의심
            if (ct.includes('text/html') || data.trim().startsWith('<!DOCTYPE') || data.trim().startsWith('<html')) {
              throw new Error(`HTML response (proxy/baseURL 확인 필요): ${data.slice(0, 120)}`);
            }
            try { return JSON.parse(data); } catch { /* passthrough */ }
          }
          return data;
        },
      ],
    });
    return res.data as T;
  } catch (e: any) {
    throw buildAxiosError(path, e);
  }
}

/* ------------------------------------------------------------------ *
 * Parsers (KIS 응답 포맷 차이 흡수)
 * ------------------------------------------------------------------ */
function parsePrice(code: string, json: any) {
  if (json?.rt_cd && String(json.rt_cd) !== '0') {
    const msg = json?.msg1 || json?.msg || 'KIS error';
    throw new Error(`KIS price error: ${msg}`);
  }
  const out = json?.output ?? json;
  const tradePrice = Number(out?.stck_prpr ?? out?.tradePrice ?? out?.tp ?? NaN);
  const changePrice = Number(out?.prdy_vrss ?? out?.changePrice ?? NaN);
  const changeRate  = Number(out?.prdy_ctrt ?? out?.changeRate  ?? NaN);
  const accVol      = Number(out?.acml_vol  ?? out?.accVol      ?? NaN);
  const name        = out?.hts_kor_isnm ?? out?.name;

  return {
    code,
    name,
    tradePrice: Number.isFinite(tradePrice) ? tradePrice : undefined,
    changeRate: Number.isFinite(changeRate) ? changeRate : undefined,
    changePrice: Number.isFinite(changePrice) ? changePrice : undefined,
    accVol: Number.isFinite(accVol) ? accVol : undefined,
    raw: json,
  };
}

function parseHistory(code: string, period: 'D'|'W'|'M', json: any) {
  if (json?.rt_cd && String(json.rt_cd) !== '0') {
    const msg = json?.msg1 || json?.msg || 'KIS error';
    throw new Error(`KIS history error: ${msg}`);
  }
  const arr = json?.output2 ?? json?.output ?? json?.items ?? [];
  const items = Array.isArray(arr)
    ? arr.map((x: any) => ({
        date:   String(x?.stck_bsop_date ?? x?.date ?? ''),
        close:  Number(x?.stck_clpr ?? x?.close ?? x?.tp ?? NaN),
        open:   Number(x?.stck_oprc ?? x?.open  ?? NaN),
        high:   Number(x?.stck_hgpr ?? x?.high  ?? NaN),
        low:    Number(x?.stck_lwpr ?? x?.low   ?? NaN),
        volume: Number(x?.acml_vol  ?? x?.volume?? NaN),
      })).filter((r: any) => r.date && Number.isFinite(r.close))
    : [];
  return { code, period, items, raw: json };
}

/* ------------------------------------------------------------------ *
 * Public API (KIS)
 * ------------------------------------------------------------------ */
export async function fetchKisPrice(
  code: string,
  ttlMs = TTL.kisPrice,
  signal?: AbortSignal
) {
  const key = `kis:price:${code}`;
  const hit = getCache<any>(key);
  if (hit) return hit;

  return once(key, async () => {
    const json = await getJSON<any>('/kis/price', { code }, signal);
    const parsed = parsePrice(code, json);
    setCache(key, parsed, ttlMs);
    return parsed;
  });
}

export async function fetchKisHistory(
  code: string,
  period: 'D'|'W'|'M' = 'D',
  ttlMs = TTL.kisHist,
  signal?: AbortSignal
) {
  const key = `kis:hist:${code}:${period}`;
  const hit = getCache<any>(key);
  if (hit) return hit;

  return once(key, async () => {
    const json = await getJSON<any>('/kis/history', { code, period }, signal);
    const parsed = parseHistory(code, period, json);
    setCache(key, parsed, ttlMs);
    return parsed;
  });
}

/* (선택) KIS 자체 검색을 쓰는 경우 */
export async function fetchKisSearch(
  keyword: string,
  signal?: AbortSignal
) {
  const q = keyword.trim();
  if (q.length < 2) return [] as KisSearch[];
  const key = `kis:search:${q.toLowerCase()}`;
  const hit = getCache<KisSearch[]>(key);
  if (hit) return hit;

  return once(key, async () => {
    const data = await getJSON<KisSearch[]>('/kis/search', { keyword: q }, signal);
    setCache(key, data, TTL.kisSearch);
    return data;
  });
}

/* ------------------------------------------------------------------ *
 * Public API (DB 기반 종목 자동완성/해석)
 * ------------------------------------------------------------------ */
export async function searchStocks(
  keyword: string,
  size = 10,
  ttlMs = TTL.stocksSearch,
  signal?: AbortSignal
): Promise<StockLite[]> {
  const q = keyword.trim();
  if (!q) return [];
  const key = `stocks:search:${q.toLowerCase()}:${size}`;
  const hit = getCache<StockLite[]>(key);
  if (hit) return hit;

  return once(key, async () => {
    const data = await getJSON<StockLite[]>('/stock-master/search', { q, size }, signal);
    setCache(key, data, ttlMs);
    return data;
  });
}

export async function resolveStock(
  keyword: string,
  ttlMs = TTL.stocksResolve,
  signal?: AbortSignal
): Promise<StockLite> {
  const q = keyword.trim();
  const key = `stocks:resolve:${q.toLowerCase()}`;
  const hit = getCache<StockLite>(key);
  if (hit) return hit;

  return once(key, async () => {
    const data = await getJSON<StockLite>('/stock-master/resolve', { q }, signal);
    setCache(key, data, ttlMs);
    return data;
  });
}
