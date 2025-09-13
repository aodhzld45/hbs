import { useEffect, useRef, useState } from 'react';
import { fetchKisPrice, fetchKisHistory } from '../services/kisApi';
import type { KisHistory, KisPrice, KisSearch } from '../types';

function useAbortable() {
  const ref = useRef<AbortController | null>(null);
  useEffect(() => () => { ref.current?.abort(); }, []);
  const next = () => {
    ref.current?.abort();
    ref.current = new AbortController();
    return ref.current.signal;
  };
  return next;
}

export function useKisPrice(code: string | undefined) {
  const [data,setData] = useState<KisPrice | null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError] = useState<any>(null);
  const nextSignal = useAbortable();

  useEffect(() => {
    if (!code || code.length < 5) return;
    setLoading(true); setError(null);
    fetchKisPrice(code, 3000, nextSignal())
      .then(setData)
      .catch(setError)
      .finally(()=>setLoading(false));
  }, [code, nextSignal]);

  return { data, loading, error };
}

export function useKisHistory(code: string | undefined, period: 'D'|'W'|'M'='D') {
  const [data,setData] = useState<KisHistory | null>(null);
  const [loading,setLoading]=useState(false);
  const [error,setError] = useState<any>(null);
  const nextSignal = useAbortable();

  useEffect(() => {
    if (!code || code.length < 5) return;
    setLoading(true); setError(null);
    fetchKisHistory(code, period, 5000, nextSignal())
      .then(setData)
      .catch(setError)
      .finally(()=>setLoading(false));
  }, [code, nextSignal, period]);

  return { data, loading, error };
}

const DEBOUNCE = 200;

/** 종목명/코드 검색 자동완성 훅 */
export function useKisSearch() {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<KisSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlight, setHighlight] = useState(-1);

  // 한글 IME 조합 대응
  const composing = useRef(false);
  const timer = useRef<number | null>(null);

  // 최근 검색 (세션 저장)
  const RECENT_KEY = "kis_recent_v1";
  const getRecent = (): KisSearch[] => {
    try { return JSON.parse(sessionStorage.getItem(RECENT_KEY) || "[]"); }
    catch { return []; }
  };
  const [recent, setRecent] = useState<KisSearch[]>(getRecent());
  const pushRecent = (item: KisSearch) => {
    const next = [item, ...recent.filter(x => x.code !== item.code)].slice(0, 8);
    setRecent(next);
    sessionStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };

  // AbortController (검색 전용)
  // const controller = useRef<AbortController | null>(null);
  // const abort = () => { controller.current?.abort(); controller.current = null; };

  // const runSearch = (q: string) => {
  //   if (q.trim().length < 2) { setList([]); setError(null); return; }
  //   abort();
  //   controller.current = new AbortController();
  //   setLoading(true); setError(null);

  //   fetchKisSearch(q, controller.current.signal)
  //     .then((rows) => setList(rows))
  //     .catch((e: any) => {
  //       if (e?.name === "CanceledError" || e?.message?.includes("canceled")) return;
  //       setError(e?.message || "검색 실패");
  //     })
  //     .finally(() => setLoading(false));
  // };

  // 디바운스 검색
  // useEffect(() => {
  //   if (!open) return;
  //   if (timer.current) window.clearTimeout(timer.current);
  //   timer.current = window.setTimeout(() => {
  //     if (!composing.current) runSearch(term);
  //   }, DEBOUNCE);
  //   return () => { if (timer.current) window.clearTimeout(timer.current); };
  // }, [term, open, runSearch]);

  // 키보드 이동
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlight(h => Math.min(h + 1, list.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)); }
    else if (e.key === "Escape") { setOpen(false); }
  };

  return {
    term, setTerm,
    open, setOpen,
    list, loading, error,
    highlight, setHighlight,
    onKeyDown,
    onCompositionStart: () => { composing.current = true; },
    onCompositionEnd: (e: React.CompositionEvent<HTMLInputElement>) => {
      composing.current = false;
      setTerm(e.currentTarget.value); // 조합 완료값 반영
    },
    recent, pushRecent,
  };
}

