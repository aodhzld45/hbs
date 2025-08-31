import React from "react";
import { useKisSearch } from "../hooks/useKis";
import type { KisSearch } from "../types";

type Props = {
  onPick: (item: KisSearch) => void;  // 선택 콜백
  className?: string;
  placeholder?: string;
};

const StockSearchBox: React.FC<Props> = ({ onPick, className, placeholder="종목명/코드 검색" }) => {
  const {
    term, setTerm,
    open, setOpen,
    list, loading, error,
    highlight, setHighlight,
    onKeyDown, onCompositionStart, onCompositionEnd,
    recent, pushRecent,
  } = useKisSearch();

  const pick = (it: KisSearch) => {
    pushRecent(it);
    onPick(it);
    setOpen(false);
  };

  return (
    <div className={`relative ${className || ""}`}>
      <input
        className="w-64 border px-3 py-2 rounded"
        value={term}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => setTerm(e.target.value)}
        onKeyDown={onKeyDown}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={onCompositionEnd}
      />

      {open && (
        <div className="absolute z-20 mt-1 w-[28rem] max-h-80 overflow-auto rounded border bg-white shadow">
          {loading && <div className="px-3 py-2 text-sm text-gray-500">검색 중…</div>}
          {error && <div className="px-3 py-2 text-sm text-red-600">{error}</div>}

          {!loading && !error && list.length === 0 && recent.length > 0 && (
            <>
              <div className="px-3 py-1 text-xs text-gray-400">최근 검색</div>
              {recent.map((it) => (
                <button
                  key={it.code}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50"
                  onMouseEnter={() => setHighlight(-1)}
                  onClick={() => pick(it)}
                >
                  <span className="font-semibold">{it.name}</span>
                  <span className="ml-2 text-xs text-gray-500">{it.code}</span>
                  {!!it.market && <span className="ml-2 text-[10px] bg-gray-100 px-1 rounded">{it.market}</span>}
                </button>
              ))}
            </>
          )}

          {!loading && !error && list.length > 0 && (
            <>
              <div className="px-3 py-1 text-xs text-gray-400">검색 결과</div>
              {list.map((it, i) => (
                <button
                  key={`${it.code}-${i}`}
                  className={`w-full text-left px-3 py-2 ${i===highlight ? "bg-blue-50" : "hover:bg-gray-50"}`}
                  onMouseEnter={() => setHighlight(i)}
                  onMouseLeave={() => setHighlight(-1)}
                  onClick={() => pick(it)}
                >
                  <span className="font-semibold">{it.name}</span>
                  <span className="ml-2 text-xs text-gray-500">{it.code}</span>
                  {!!it.market && <span className="ml-2 text-[10px] bg-gray-100 px-1 rounded">{it.market}</span>}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StockSearchBox;
