import React, { useState } from 'react';

type Props = {
  keyword: string;
  onKeywordChange: (v: string) => void;
  onSearch: () => void;
  size: number;
  onSizeChange: (n: number) => void;
  onCreate: () => void;
};

export default function Toolbar({
  keyword, onKeywordChange, onSearch,
  size, onSizeChange, onCreate,
}: Props) {
  const [local, setLocal] = useState(keyword);

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3">
      <div className="flex-1 flex gap-2">
        <input
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { onKeywordChange(local); onSearch(); } }}
          placeholder="이름/메모 검색"
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          className="px-3 py-2 border rounded"
          onClick={() => { onKeywordChange(local); onSearch(); }}
        >
          검색
        </button>
      </div>
      <div className="flex items-center gap-2">
        <select
          className="border rounded px-2 py-2"
          value={size}
          onChange={(e) => onSizeChange(Number(e.target.value))}
        >
          {[10, 20, 50].map(n => <option key={n} value={n}>{n}/페이지</option>)}
        </select>
        <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={onCreate}>
          새 설정
        </button>
      </div>
    </div>
  );
}
