// src/features/Kis/components/KisPanel.tsx
import React, { useState, useMemo } from 'react';
import StockSearchBox from './StockSearchBox';
import { toYmd, coerceDateInput } from '../../../../utils/date';
import type { CandleDto, StockLite } from '../types';
import { useKisDailyCandles } from '../hooks/useKisDailyCandles';
import CandleChart from '../charts/CandleChart';

type Period = 'D'|'W'|'M';

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toYmd(d);
};

export default function KisPanel() {
  const [sel, setSel] = useState<StockLite | null>(null);
  const [period, setPeriod] = useState<Period>('D');
  const [from, setFrom] = useState<string>(() => daysAgo(14));
  const [to, setTo]     = useState<string>(() => toYmd(new Date()));

  const { data: candles, loading, error } = useKisDailyCandles(
    sel?.symbol, from, to, period, '0'
  );

  const viewPrice = useMemo(() => {
    if (!candles || candles.length === 0) return null;
    const last = candles[candles.length - 1];
    const prev = candles.length >= 2 ? candles[candles.length - 2] : null;
    const changeRate =
      prev && prev.close ? ((last.close - prev.close) / prev.close) * 100 : undefined;
    return { tradePrice: last.close, changeRate, accVol: last.volume };
  }, [candles]);

  function onPick(s: StockLite) { setSel(s); }
  function onChangePeriod(e: React.ChangeEvent<HTMLSelectElement>) {
    setPeriod(e.target.value as Period);
  }
  function onChangeFrom(e: React.ChangeEvent<HTMLInputElement>) {
    setFrom(coerceDateInput(e.target.value));
  }
  function onChangeTo(e: React.ChangeEvent<HTMLInputElement>) {
    setTo(coerceDateInput(e.target.value));
  }

  return (
    <div className="space-y-4 px-3 pb-[env(safe-area-inset-bottom)] sm:px-4">
      {/* 컨트롤 바: 모바일 1열, md 이상 그리드 */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-5 md:items-center">
        {/* 종목 검색 */}
        <div className="col-span-1 md:col-span-2 min-w-0">
          <StockSearchBox onPick={onPick} placeholder="삼성, 카카오 또는 005930…" />
        </div>

        {/* 기간 선택 - 모바일 select / 데스크톱 세그먼트 */}
        <div className="md:hidden">
          <label className="sr-only" htmlFor="period">기간</label>
          <select
            id="period"
            value={period}
            onChange={onChangePeriod}
            className="w-full rounded-md border px-3 py-3 min-h-[44px]"
          >
            <option value="D">일(D)</option>
            <option value="W">주(W)</option>
            <option value="M">월(M)</option>
          </select>
        </div>

        {/* 기간 선택 – 데스크톱 세그먼트 */}
        <div className="hidden md:flex md:col-span-1 justify-start shrink-0">
          <div role="tablist" aria-label="기간" className="inline-flex overflow-hidden rounded-xl border">
            {(['D','W','M'] as const).map(p => (
              <button
                key={p}
                role="tab"
                aria-selected={period === p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 min-h-[44px] ${period===p ? 'bg-blue-600 text-white' : 'bg-white dark:bg-zinc-800 dark:text-zinc-200'} border-r last:border-r-0`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* 날짜 범위 */}
        <div
          className="
            grid grid-cols-2 gap-2 md:col-span-2 md:items-center
            md:[grid-template-columns:minmax(12rem,1fr)_auto_minmax(12rem,1fr)]
          "
        >
            <div>
            <label className="sr-only" htmlFor="from">시작일</label>
            <input
              id="from"
              type="date"
              value={from}
              onChange={onChangeFrom}
              className="
                w-full rounded-md border px-3 pr-10 py-3 min-h-[44px]
                font-mono tabular-nums text-center
                dark:bg-zinc-900 dark:text-gray-100 dark:border-zinc-700 dark:[color-scheme:dark]
              "
                 />
          </div>
          
          {/* 가운데 ~ 표시 (md 이상에서만 표시) */}
          <div className="hidden md:flex items-center justify-center text-gray-500">~</div>


          <div className="min-w-0">
            <label className="sr-only" htmlFor="to">종료일</label>
            <input
              id="to"
              type="date"
              value={to}
              onChange={onChangeTo}
              className="
                w-full rounded-md border px-3 pr-10 py-3 min-h-[44px]
                font-mono tabular-nums text-center
                dark:bg-zinc-900 dark:text-gray-100 dark:border-zinc-700 dark:[color-scheme:dark]
              " 
                />
          </div>
        </div>
      </div>

      {/* 차트 */}
      <div>
        {!sel && <p className="text-gray-500">종목을 선택하세요</p>}
        {sel && loading && <p>불러오는 중…</p>}
        {sel && error && <p className="text-sm text-red-600">차트 오류: {String(error)}</p>}
        {sel && !loading && !error && candles?.length! > 0 && (
          <>
            <h2 className="mt-1 text-base md:text-lg font-semibold dark:text-gray-300">
              {sel.symbol} 차트 ({period})
            </h2>
            {/* 차트 컨테이너를 반응형으로 */}
            <div className="w-full overflow-hidden rounded-lg border bg-white/50 dark:bg-zinc-900">
              <CandleChart data={candles as CandleDto[]} title={`${sel.symbol} (${period})`} />
            </div>
          </>
        )}
        {sel && !loading && !error && (!candles || candles.length === 0) && (
          <p className="text-sm text-gray-500">데이터 없음</p>
        )}
      </div>

      {/* 종목 정보 & 가격 박스 */}
      {sel && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="text-sm text-gray-700 dark:text-gray-300 md:col-span-2">
            <span className="font-semibold">{sel.name}</span>
            <span className="ml-2 text-gray-500">({sel.symbol} · {sel.market})</span>
          </div>

          {viewPrice && (
            <div className="rounded-xl border p-4">
              <div className="text-2xl md:text-3xl font-bold dark:text-gray-100">
                {Number(viewPrice.tradePrice).toLocaleString()}
              </div>
              {viewPrice.changeRate != null && (
                <div
                  className={`text-sm md:text-base ${
                    viewPrice.changeRate > 0
                      ? 'text-red-600'
                      : viewPrice.changeRate < 0
                      ? 'text-blue-600'
                      : 'text-gray-600'
                  }`}
                >
                  {viewPrice.changeRate > 0 ? '+' : ''}
                  {Number(viewPrice.changeRate).toFixed(2)}%
                </div>
              )}
              <div className="mt-1 text-xs text-gray-500">
                거래량: {Number(viewPrice.accVol).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 일자별 시세 – 모바일 카드 / 데스크톱 테이블 */}
      <div className="rounded-xl border">
        <div className="border-b px-4 py-2 font-semibold dark:text-gray-200">
          일자별 시세 ({period})
        </div>

        {/* 모바일: 카드 리스트 */}
        <div className="md:hidden divide-y">
          {loading && <div className="p-4 text-center text-gray-500">불러오는 중…</div>}
          {!loading && candles?.length
            ? candles!.map((r) => (
                <div key={r.date} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{r.date}</div>
                    <div className="text-base font-semibold">
                      {Number(r.close).toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-1 grid grid-cols-3 gap-2 text-xs text-gray-600">
                    <div>고가 {Number(r.high).toLocaleString()}</div>
                    <div>저가 {Number(r.low).toLocaleString()}</div>
                    <div className="text-right">거래량 {Number(r.volume).toLocaleString()}</div>
                  </div>
                </div>
              ))
            : !loading && <div className="p-6 text-center text-gray-500">데이터 없음</div>}
        </div>

        {/* 데스크톱: 테이블 */}
        <div className="hidden md:block max-h-96 overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 dark:bg-zinc-800">
              <tr className="border-b dark:text-gray-100">
                <th className="px-3 py-2 text-left">날짜</th>
                <th className="px-3 py-2 text-right">종가</th>
                <th className="px-3 py-2 text-right">고가</th>
                <th className="px-3 py-2 text-right">저가</th>
                <th className="px-3 py-2 text-right">거래량</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-500 dark:text-gray-100">불러오는 중…</td></tr>
              )}
              {!loading && candles?.map((r) => (
                <tr key={r.date} className="odd:bg-white even:bg-gray-50 dark:odd:bg-zinc-900 dark:even:bg-zinc-800 dark:text-gray-100">
                  <td className="px-3 py-2">{r.date}</td>
                  <td className="px-3 py-2 text-right">{Number(r.close).toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">{Number(r.high).toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">{Number(r.low).toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">{Number(r.volume).toLocaleString()}</td>
                </tr>
              ))}
              {!loading && (!candles || candles.length === 0) && (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-500 dark:text-gray-100">데이터 없음</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
