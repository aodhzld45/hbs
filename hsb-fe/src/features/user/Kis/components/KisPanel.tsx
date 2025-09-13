// src/features/Kis/components/KisPanel.tsx
import React, { useState, useMemo } from 'react';
import StockSearchBox from './StockSearchBox';
import ChartPage from './ChartPage';
import { fetchKisPrice, fetchKisHistory } from '../services/kisApi';
import { toYmd, toYmdCompact, coerceDateInput } from '../../../../utils/date';

import type { StockLite } from '../types';

type Period = 'D'|'W'|'M';

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toYmd(d); // yyyy-mm-dd
};

export default function KisPanel() {
  const [sel, setSel] = useState<StockLite | null>(null);
  const [period, setPeriod] = useState<Period>('D');

  const [from, setFrom] = useState<string>(() => daysAgo(14));
  const [to, setTo]     = useState<string>(() => toYmd(new Date()));

  const [price, setPrice] = useState<any>(null);
  const [rows, setRows] = useState<any[]>([]);

  const viewRows = useMemo(() => {
    const f = toYmdCompact(from);
    const t = toYmdCompact(to);
   return rows.filter(r => r.date >= f && r.date <= t); // r.date는 YYYYMMDD
 }, [rows, from, to]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load(s: StockLite, p: Period) {
    setLoading(true); setErr(null);
    try {
      const [pr, hi] = await Promise.all([
        fetchKisPrice(s.symbol),
        fetchKisHistory(s.symbol, p),
      ]);
      setPrice(pr);
      setRows(hi.items ?? []);
    } catch (e: any) {
      setErr(e?.message ?? 'error');
    } finally {
      setLoading(false);
    }
  }

  function onPick(s: StockLite) {
    setSel(s);
    load(s, period);
  }

  function onChangePeriod(e: React.ChangeEvent<HTMLSelectElement>) {
    const p = e.target.value as Period;
    setPeriod(p);
    if (sel) load(sel, p);
  }

  // from/to 변경 시 ChartPage가 props로 받아 훅을 통해 새로 호출됨
  function onChangeFrom(e: React.ChangeEvent<HTMLInputElement>) {
    setFrom(coerceDateInput(e.target.value));
  }
  function onChangeTo(e: React.ChangeEvent<HTMLInputElement>) {
    setTo(coerceDateInput(e.target.value));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <StockSearchBox onPick={onPick} placeholder="삼성, 카카오 또는 005930…" />
        </div>
        <select value={period} onChange={onChangePeriod} className="rounded-md border px-2 py-2">
          <option value="D">D</option><option value="W">W</option><option value="M">M</option>
        </select>

        {/*  기간 입력 */}
        <input type="date" value={from} onChange={onChangeFrom} className="rounded-md border px-2 py-2" />
        <span className="text-gray-500">~</span>
        <input type="date" value={to} onChange={onChangeTo} className="rounded-md border px-2 py-2" />
      </div>

      <div>
       <ChartPage
          code={sel?.symbol}
          from={from}
          to={to}
          period={period}
          adj="0"
        />
      </div>
      
      {sel && (
        <div className="text-sm text-gray-700">
          <span className="font-semibold dark:text-gray-400">{sel.name}</span>
          <span className="ml-2 text-gray-500 dark:text-gray-400">({sel.symbol} · {sel.market})</span>
        </div>
      )}
      {err && <div className="rounded bg-red-50 p-3 text-sm text-red-700">에러: {err}</div>}

      {price && (
        <div className="rounded border p-4">
          <div className="text-3xl font-bold dark:text-gray-400">{Number(price.tradePrice).toLocaleString()}</div>
          <div className={`text-sm ${price.changeRate>0?'text-red-600':price.changeRate<0?'text-blue-600':'text-gray-600'}`}>
            {price.changeRate>0?'+':''}{Number(price.changeRate).toFixed(2)}%
          </div>
          <div className="mt-1 text-xs text-gray-500">거래량: {Number(price.accVol).toLocaleString()}</div>
        </div>
      )}

      <div className="rounded border">
        <div className="border-b px-4 py-2 font-semibold dark:text-gray-400">일자별 시세 ({period})</div>
        <div className="max-h-96 overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">날짜</th>
                <th className="px-3 py-2 text-right">종가</th>
                <th className="px-3 py-2 text-right">고가</th>
                <th className="px-3 py-2 text-right">저가</th>
                <th className="px-3 py-2 text-right">거래량</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-500">불러오는 중…</td></tr>}
              {!loading && viewRows.map(r => (
                <tr key={r.date} className="odd:bg-white even:bg-gray-50">
                  <td className="px-3 py-2">{toYmd(r.date)}</td>
                  <td className="px-3 py-2 text-right">{Number(r.close).toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">{Number(r.high).toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">{Number(r.low).toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">{Number(r.volume).toLocaleString()}</td>
                </tr>
              ))}
              {!loading && viewRows.length === 0 && (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-500">데이터 없음</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
