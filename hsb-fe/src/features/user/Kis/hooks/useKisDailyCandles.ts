import { useCallback, useEffect, useState, useRef } from "react";
import { fetchKisDailyCandles } from "../services/kisApi";
import type { CandleDto } from "../types";

function useAbortable() {
  const ref = useRef<AbortController | null>(null);
  useEffect(() => () => { ref.current?.abort(); }, []);
  // 아이덴티티 고정
  const next = useCallback(() => {
    ref.current?.abort();
    ref.current = new AbortController();
    return ref.current.signal;
  }, []);
  return next;
}

/**
 * 백엔드 BFF (/api/kis/chart/daily) 기반 캔들 데이터 훅
 */
export function useKisDailyCandles(
  code: string | undefined,
  from: string,
  to: string,
  period: "D" | "W" | "M" | "Y" = "D",
  adj: "0" | "1" = "0"
) {
  const [data, setData] = useState<CandleDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const nextSignal = useAbortable();

  useEffect(() => {
    if (!code || code.length < 5) return;
    setLoading(true); setError(null);
    fetchKisDailyCandles(code, from, to, period, adj, 5000, nextSignal())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  //  nextSignal 제거(또는 useCallback으로 고정했으니 둬도 무방)
  }, [code, from, to, period, adj]);

  return { data, loading, error };
}