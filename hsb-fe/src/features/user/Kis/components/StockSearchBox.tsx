import React, { useEffect, useRef, useState } from 'react';
import { searchStocks, resolveStock } from '../services/kisApi';
import type { StockLite } from '../types';

type Props = {
  onPick: (s: StockLite) => void;
  placeholder?: string;
  defaultQuery?: string;
  size?: number;
};

export default function StockSearchBox({
  onPick,
  placeholder = '종목명 또는 코드(6자리)로 검색',
  defaultQuery = '',
  size = 8,
}: Props) {
  const [q, setQ] = useState(defaultQuery);
  const [items, setItems] = useState<StockLite[]>([]);
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const [loading, setLoading] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const debRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // 외부 클릭 닫기
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // 디바운스 자동완성 + Abort
  useEffect(() => {
    if (debRef.current) window.clearTimeout(debRef.current);
    if (!q.trim()) { setItems([]); return; }

    debRef.current = window.setTimeout(async () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      try {
        setLoading(true);
        const list = await searchStocks(q, size, 15_000, abortRef.current.signal);
        setItems(list); setOpen(true); setHi(-1);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => { if (debRef.current) window.clearTimeout(debRef.current); };
  }, [q, size]);

  async function commit() {
    // 하이라이트 선택 우선, 아니면 입력값 resolve
    if (hi >= 0 && items[hi]) {
      const s = items[hi];
      onPick(s);
      setQ(`${s.shortName} (${s.symbol})`);
      setOpen(false);
      return;
    }
    try {
      const s = await resolveStock(q);
      onPick(s);
      setQ(`${s.shortName} (${s.symbol})`);
      setOpen(false);
    } catch {
      setOpen(true); // 못 찾으면 그대로 열어두기
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi(h => Math.min(h + 1, items.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setHi(h => Math.max(h - 1, -1)); }
    if (e.key === 'Enter')     { e.preventDefault(); commit(); }
    if (e.key === 'Escape')    { setOpen(false); }
  }

  return (
    <div ref={wrapRef} className="relative w-full">
      <input
        className="w-full rounded-md border px-3 py-2 outline-none focus:ring"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => q && setOpen(true)}
        onKeyDown={onKey}
        placeholder={placeholder}
      />
      {open && (
        <div className="absolute z-30 mt-1 w-full max-h-72 overflow-auto rounded-md border bg-white shadow">
          {loading && <div className="px-3 py-2 text-sm text-gray-500">검색중…</div>}
          {!loading && items.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">결과 없음</div>
          )}
          {!loading && items.map((it, idx) => (
            <button
              key={it.symbol}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${hi===idx ? 'bg-gray-100' : ''}`}
              onMouseEnter={() => setHi(idx)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onPick(it); setQ(`${it.shortName} (${it.symbol})`); setOpen(false); }}
            >
              <div className="font-medium">
                {it.shortName} <span className="text-gray-500">({it.symbol})</span>
              </div>
              <div className="text-xs text-gray-500">{it.market}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
