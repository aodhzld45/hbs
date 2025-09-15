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
  return toYmd(d); // yyyy-mm-dd
};

export default function KisPanel() {
  const [sel, setSel] = useState<StockLite | null>(null);
  const [period, setPeriod] = useState<Period>('D');

  const [from, setFrom] = useState<string>(() => daysAgo(14));
  const [to, setTo]     = useState<string>(() => toYmd(new Date()));

    // 차트/테이블 공용 데이터 — 같은 파라미터로 한 번만 호출
  const { data: candles, loading, error } = useKisDailyCandles(
    sel?.symbol,
    from,
    to,
    period,
    '0'
  );

    // 가격 박스: 마지막 캔들로 계산(별도 /kis/price 호출 불필요)
  const viewPrice = useMemo(() => {
    if (!candles || candles.length === 0) return null;
    const last = candles[candles.length - 1];
    const prev = candles.length >= 2 ? candles[candles.length - 2] : null;
    const changeRate =
      prev && prev.close
        ? ((last.close - prev.close) / prev.close) * 100
        : undefined;
    return {
      tradePrice: last.close,
      changeRate,
      accVol: last.volume,
    };
  }, [candles]);

  function onPick(s: StockLite) {
    setSel(s);
  }

  function onChangePeriod(e: React.ChangeEvent<HTMLSelectElement>) {
    setPeriod(e.target.value as Period);
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

      {/* 차트 */}
      <div>
        {!sel && <p className="text-gray-500">종목을 선택하세요</p>}
        {sel && loading && <p>불러오는 중...</p>}
        {sel && error && (
          <p className="text-sm text-red-600">차트 오류: {String(error)}</p>
        )}
        {sel && !loading && !error && candles && candles.length > 0 && (
          <>
            <h2 className="text-lg font-semibold dark:text-gray-300">
              {sel.symbol} 차트 ({period})
            </h2>
            <CandleChart data={candles as CandleDto[]} title={`${sel.symbol} (${period})`} />
          </>
        )}
        {sel && !loading && !error && (!candles || candles.length === 0) && (
          <p className="text-sm text-gray-500">데이터 없음</p>
        )}
      </div>
      
      {/* 종목 정보 */}
      {sel && (
        <div className="text-sm text-gray-700">
          <span className="font-semibold dark:text-gray-400">{sel.name}</span>
          <span className="ml-2 text-gray-500 dark:text-gray-400">
            ({sel.symbol} · {sel.market})
          </span>
        </div>
      )}

      {/* 가격 박스: 마지막 캔들 기준 */}
      {viewPrice && (
        <div className="rounded border p-4">
          <div className="text-3xl font-bold dark:text-gray-400">
            {Number(viewPrice.tradePrice).toLocaleString()}
          </div>
          {viewPrice.changeRate != null && (
            <div
              className={`text-sm ${
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

      {/* 일자별 시세 */}
      <div className="rounded border">
        <div className="border-b px-4 py-2 font-semibold dark:text-gray-400">
          일자별 시세 ({period})
        </div>
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
              {loading && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                    불러오는 중…
                  </td>
                </tr>
              )}
              {!loading &&
                candles?.map((r) => (
                  <tr key={r.date} className="odd:bg-white even:bg-gray-50">
                    {/* CandleDto.date는 yyyy-MM-dd */}
                    <td className="px-3 py-2">{r.date}</td>
                    <td className="px-3 py-2 text-right">
                      {Number(r.close).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {Number(r.high).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {Number(r.low).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {Number(r.volume).toLocaleString()}
                    </td>
                  </tr>
                ))}
              {!loading && (!candles || candles.length === 0) && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-gray-500"
                  >
                    데이터 없음
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
  );
}
