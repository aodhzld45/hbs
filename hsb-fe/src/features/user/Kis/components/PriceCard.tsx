import React from 'react';
import type { KisPrice } from '../types';

export default function PriceCard({ p }: { p: KisPrice | null }) {
  if (!p) return null;
  const up = (p.changeRate ?? 0) >= 0;
  return (
    <div className="border rounded p-3 bg-white shadow-sm">
      <div className="text-sm text-gray-500">{p.code}{p.name ? ` · ${p.name}` : ''}</div>
      <div className="text-2xl font-bold mt-1">{p.tradePrice?.toLocaleString() ?? '-'}</div>
      <div className={`text-sm ${up ? 'text-red-600' : 'text-blue-600'}`}>
        {p.changePrice?.toLocaleString() ?? '-'} ({p.changeRate ?? '-'}%)
      </div>
      <div className="text-xs text-gray-500 mt-1">거래량: {p.accVol?.toLocaleString() ?? '-'}</div>
    </div>
  );
}
