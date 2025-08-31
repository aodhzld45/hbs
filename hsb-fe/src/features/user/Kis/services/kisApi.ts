// src/features/Kis/services/kisApi.ts
// axios 기반 / TTL 메모리 캐시 / AbortController 지원 / HTML 응답 감지 + inflight 병합
import api from '../../../../services/api';
// 종목명/코드 검색 (DTO : {code, name} [])
import { KisSearch } from '../types';

// ---- 메모리 캐시 ----
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
  memoryCache.set(key, { exp: now() + ttlMs, data });
}

// ---- inflight 병합 (동일 키 동시요청 → 1회) ----
const inflight = new Map<string, Promise<any>>();
async function once<T>(key: string, factory: () => Promise<T>): Promise<T> {
  const hit = inflight.get(key);
  if (hit) return hit as Promise<T>;
  const p = factory().finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

// ---- 공통 호출 (axios) ----
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
          const ct = (
            headers?.['content-type'] || headers?.['Content-Type'] || ''
          ).toString();
          if (typeof data === 'string') {
            if (
              ct.includes('text/html') ||
              data.trim().startsWith('<!DOCTYPE') ||
              data.trim().startsWith('<html')
            ) {
              throw new Error(
                `HTML response (proxy/baseURL 확인 필요): ${data.slice(
                  0,
                  120
                )}`
              );
            }
            try {
              return JSON.parse(data);
            } catch {
              /* fallthrough */
            }
          }
          return data;
        },
      ],
    });
    return res.data as T;
  } catch (e: any) {
    const status = e?.response?.status;
    const text =
      typeof e?.response?.data === 'string'
        ? e.response.data
        : JSON.stringify(e?.response?.data || {});
    throw new Error(
      `[KIS GET ${path}] ${status ?? ''} ${e?.message || ''}\n${text.slice(
        0,
        200
      )}`
    );
  }
}

// ---- 파서 ----
function parsePrice(code: string, json: any) {
  // KIS 오류 포맷 가드 (rt_cd가 0이 아니면 실패)
  if (json?.rt_cd && String(json.rt_cd) !== '0') {
    const msg = json?.msg1 || json?.msg || 'KIS error';
    throw new Error(`KIS price error: ${msg}`);
  }
  const out = json?.output ?? json;

  const tradePrice = Number(out?.stck_prpr ?? out?.tradePrice ?? out?.tp ?? NaN);
  const changePrice = Number(out?.prdy_vrss ?? out?.changePrice ?? NaN);
  const changeRate = Number(out?.prdy_ctrt ?? out?.changeRate ?? NaN);
  const accVol = Number(out?.acml_vol ?? out?.accVol ?? NaN);
  const name = out?.hts_kor_isnm ?? out?.name;

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
  const items = Array.isArray(arr) ? arr.map((x: any) => ({
    date: String(x?.stck_bsop_date ?? x?.date ?? ''),
    close: Number(x?.stck_clpr ?? x?.close ?? x?.tp ?? NaN),
    open:  Number(x?.stck_oprc ?? x?.open  ?? NaN),
    high:  Number(x?.stck_hgpr ?? x?.high  ?? NaN),
    low:   Number(x?.stck_lwpr ?? x?.low   ?? NaN),
    volume:Number(x?.acml_vol  ?? x?.volume?? NaN),
  })).filter((r:any)=> r.date && Number.isFinite(r.close)) : [];

  return { code, period, items, raw: json };
}

// ---- Public API ----
export async function fetchKisPrice(
  code: string,
  ttlMs = 3000,
  signal?: AbortSignal
) {
  const key = `price:${code}`;
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
  period: 'D' | 'W' | 'M' = 'D',
  ttlMs = 5000,
  signal?: AbortSignal
) {
  const key = `hist:${code}:${period}`;
  const hit = getCache<any>(key);
  if (hit) return hit;
  return once(key, async () => {
    const json = await getJSON<any>(
      '/kis/history',
      { code, period },
      signal
    );
    const parsed = parseHistory(code, period, json);
    setCache(key, parsed, ttlMs);
    return parsed;
  });
}

export async function fetchKisSearch(
  keyword: string,
  signal?: AbortSignal
) {
  const q = keyword.trim();
  if (q.length < 2) return [] as KisSearch[];
  const key = `search:${q.toLowerCase()}`;
  const hit = getCache<KisSearch[]>(key);
  if (hit) return hit;
  return once(key, async () => {
    const { data } = await api.get<KisSearch[]>(`/kis/search`, {
      params: { keyword: q },
      signal,
    });
    setCache(key, data, 15_000);
    return data;
  });
}
