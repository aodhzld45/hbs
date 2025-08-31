import React, { useState } from 'react';
import { useKisPrice, useKisHistory } from '../hooks/useKis';

import type { KisSearch } from '../types';

import PriceCard from './PriceCard';
import HistoryTable from './HistoryTable';
import StockSearchBox from './StockSearchBox';

export default function KisPanel() {
    const [tempCode, setTempCode] = useState('005930');  // 입력창 표시용
  // const [name, setName] = useState('삼성전자'); // 필요하면 종목명도 상태로 관리
  const [code, setCode] = useState('005930'); // 조회에 쓰는 확정값
  const [period, setPeriod] = useState<'D'|'W'|'M'>('D');

  const { data: price, loading: lp, error: ep } = useKisPrice(code);
  const { data: hist,  loading: lh, error: eh } = useKisHistory(code, period);

  const commitCode = (next: string) => {
    if (/^\d{6}$/.test(next)) setCode(next); // 6자리일 때만 조회
  };

  const onManualChange = (v: string) => {
    const onlyDigits = v.replace(/\D/g, '').slice(0, 6);
    setTempCode(onlyDigits);                  // 입력창만 업데이트
    // 자동 커밋을 원하면, 아래 한 줄 주석 해제(6자리 찍히면 1회 커밋)
    // if (onlyDigits.length === 6) commitCode(onlyDigits);
  };

  const onManualKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitCode(tempCode);
  };

  const handlePick = (it: KisSearch) => {
    setTempCode(it.code);
    commitCode(it.code);                      // 자동완성 선택 시에만 커밋
    // setName(it.name);                       // 필요하면 종목명도 같이 설정
  };


return (
    <div className="p-4 space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        {/* 자동완성 검색 박스 */}
        {/* <StockSearchBox onPick={handlePick} /> */}

        {/* 수동 입력은 temp만 바꾸고, Enter에만 커밋 */}
        <input
          value={tempCode}
          onChange={e => onManualChange(e.target.value)}
          onKeyDown={onManualKey}
          className="border px-2 py-1 rounded"
          placeholder="종목코드(6자리)"
        />

        <select
          value={period}
          onChange={e=>setPeriod(e.target.value as any)}
          className="border px-2 py-1 rounded"
        >
          <option value="D">D</option>
          <option value="W">W</option>
          <option value="M">M</option>
        </select>

        {(lp||lh) && <span className="text-xs text-gray-500">조회 중…</span>}
        {(ep||eh) && <span className="text-xs text-red-600">조회 실패</span>}
      </div>

      <PriceCard p={price ?? null} />
      <HistoryTable h={hist ?? null} />
    </div>
  );
}

