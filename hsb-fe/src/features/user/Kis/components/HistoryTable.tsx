import React from 'react';
import type { KisHistory } from '../types';

export default function HistoryTable({ h }: { h: KisHistory | null }) {
  if (!h) return null;
  return (
    <div className="border rounded p-3 bg-white shadow-sm">
      <div className="font-semibold mb-2">일자별 시세 ({h.period})</div>
      <div className="max-h-64 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="text-left p-1">날짜</th>
              <th className="text-right p-1">종가</th>
              <th className="text-right p-1">고가</th>
              <th className="text-right p-1">저가</th>
              <th className="text-right p-1">거래량</th>
            </tr>
          </thead>
          <tbody>
            {h.items.map((it, i) => (
              <tr key={i} className="border-t">
                <td className="p-1">{it.date}</td>
                <td className="p-1 text-right">{isFinite(it.close) ? it.close.toLocaleString() : '-'}</td>
                <td className="p-1 text-right">{isFinite(it.high ?? NaN) ? it.high!.toLocaleString() : '-'}</td>
                <td className="p-1 text-right">{isFinite(it.low ?? NaN) ? it.low!.toLocaleString() : '-'}</td>
                <td className="p-1 text-right">{isFinite(it.volume ?? NaN) ? it.volume!.toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
