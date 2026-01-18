import React, { useMemo } from "react";

import { useSiteKeyOptions } from "../../../Common/hooks/useSiteKeyOptions";

import type {
  KbSourceListResponse,
  KbSourceResponse,
} from "../types/kbSourceConfig";
import { toggleKbSourceUseTf, deleteKbSourceSoft } from "../services/kbSourceApi";

type KbSourceListParams = {
  siteKeyId?: number;
  keyword?: string;
  useTf?: "Y" | "N";
  page?: number;
  size?: number;
  sort?: string;
};

type Props = {
  params: KbSourceListParams;
  setParams: React.Dispatch<React.SetStateAction<KbSourceListParams>>;
  data: KbSourceListResponse; // useKbSourceList에서 기본값 객체를 반환
  loading: boolean;
  error: string | null;
  onRefetch: () => void;

  onOpenCreate: () => void;
  onOpenEdit: (row: KbSourceResponse) => void;
};

export default function KbSourceList({
  params,
  setParams,
  data,
  loading,
  error,
  onRefetch,
  onOpenCreate,
  onOpenEdit,
}: Props) {
  const { loadingKeys, siteKeyOptions, keysError, siteKeys } =
    useSiteKeyOptions();

  const siteKeyNameMap = useMemo(() => {
    const m = new Map<number, string>();
    for (const k of siteKeys as any[]) {
      m.set(k.id, k.siteKeyName ?? k.name ?? `#${k.id}`);
    }
    return m;
  }, [siteKeys]);

  // ===== actions =====
  const onSearchClick = () => {
    setParams((p) => ({ ...p, page: 0 }));
  };

  const onResetClick = () => {
    setParams(() => ({
      siteKeyId: undefined,
      keyword: "",
      useTf: undefined,
      page: 0,
      size: 20,
      sort: "regDate,desc",
    }));
  };

  const onToggleUse = async (row: KbSourceResponse) => {
    try {
      await toggleKbSourceUseTf(row.id);
      onRefetch();
    } catch (e: any) {
      alert(e?.message || "사용여부 변경 실패");
    }
  };

  const onDelete = async (row: KbSourceResponse) => {
    if (!window.confirm(`"${row.sourceName}" 소스를 삭제(숨김) 처리할까요?`))
      return;
    try {
      await deleteKbSourceSoft(row.id);
      onRefetch();
    } catch (e: any) {
      alert(e?.message || "삭제 실패");
    }
  };

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  return (
    <div className="space-y-4">
      {/* 헤더: 신규등록 우측 */}
      <div className="flex items-center justify-end">
        <button
          className="h-10 px-3 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700"
          onClick={onOpenCreate}
          type="button"
        >
          신규 등록
        </button>
      </div>

      {/* 필터바 */}
      <div className="bg-white border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* SiteKey */}
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-700 mb-1 h-4">
              Site Key
            </label>
            <select
              value={params.siteKeyId ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setParams((p) => ({
                  ...p,
                  siteKeyId: v ? Number(v) : undefined,
                  page: 0,
                }));
              }}
              className="w-full h-10 border rounded px-2 text-sm bg-white"
            >
              <option value="">(전체)</option>
              {siteKeyOptions.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                >
                  {opt.label}
                </option>
              ))}
            </select>

            <div className="mt-1 h-4">
              {loadingKeys && (
                <span className="text-[11px] text-gray-400">
                  사이트키 목록 로딩 중...
                </span>
              )}
              {keysError && (
                <span className="text-[11px] text-red-500">{keysError}</span>
              )}
            </div>
          </div>

          {/* keyword */}
          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-gray-700 mb-1 h-4">
              키워드 (이름/설명)
            </label>
            <input
              value={params.keyword ?? ""}
              onChange={(e) =>
                setParams((p) => ({ ...p, keyword: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") onSearchClick();
              }}
              placeholder="검색어를 입력하세요"
              className="w-full h-10 border rounded px-2 text-sm"
            />
            <div className="mt-1 h-4" />
          </div>

          {/* useTf */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1 h-4">
              사용여부
            </label>
            <select
              value={params.useTf ?? ""}
              onChange={(e) => {
                const v = e.target.value as "Y" | "N" | "";
                setParams((p) => ({
                  ...p,
                  useTf: v ? (v as "Y" | "N") : undefined,
                  page: 0,
                }));
              }}
              className="w-full h-10 border rounded px-2 text-sm bg-white"
            >
              <option value="">전체</option>
              <option value="Y">사용(Y)</option>
              <option value="N">미사용(N)</option>
            </select>
            <div className="mt-1 h-4" />
          </div>

          {/* size */}
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-gray-700 mb-1 h-4">
              크기
            </label>
            <select
              value={params.size ?? 20}
              onChange={(e) =>
                setParams((p) => ({
                  ...p,
                  size: Number(e.target.value),
                  page: 0,
                }))
              }
              className="w-full h-10 border rounded px-2 text-sm bg-white"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <div className="mt-1 h-4" />
          </div>

          {/* actions */}
          <div className="md:col-span-2 flex gap-2 justify-end">
            <button
              className="h-10 px-3 text-sm rounded border bg-white hover:bg-gray-50 whitespace-nowrap"
              onClick={onResetClick}
              type="button"
            >
              초기화
            </button>
            <button
              className="h-10 px-3 text-sm rounded bg-gray-900 text-white hover:bg-black whitespace-nowrap"
              onClick={onSearchClick}
              type="button"
            >
              검색
            </button>
          </div>
        </div>

        {/* 하단 상태 메시지 */}
        <div className="mt-2 min-h-[18px]">
          {error && <span className="text-xs text-red-500">{error}</span>}
          {loading && !error && (
            <span className="text-xs text-gray-400">조회 중...</span>
          )}
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="text-left px-3 py-2 w-[80px]">ID</th>
              <th className="text-left px-3 py-2 w-[160px]">SiteKey</th>
              <th className="text-left px-3 py-2 w-[240px]">Source 이름</th>
              <th className="text-left px-3 py-2">설명</th>
              <th className="text-center px-3 py-2 w-[90px]">사용</th>
              <th className="text-left px-3 py-2 w-[180px]">등록일</th>
              <th className="text-right px-3 py-2 w-[220px]">액션</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading && (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-gray-400">
                  조회 중...
                </td>
              </tr>
            )}

            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            )}

            {!loading &&
              items.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-500">{row.id}</td>
                  <td className="px-3 py-2">
                    {siteKeyNameMap.get(row.siteKeyId) ?? `#${row.siteKeyId}`}
                  </td>
                  <td className="px-3 py-2 font-medium text-gray-900">
                    <span className="block truncate max-w-[240px]">
                      {row.sourceName}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    <span className="block max-w-[520px] truncate">
                      {row.description ?? "-"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      className={`inline-flex items-center px-2 py-1 rounded text-xs border ${
                        row.useTf === "Y"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-gray-100 border-gray-200 text-gray-600"
                      }`}
                      onClick={() => onToggleUse(row)}
                      title="사용여부 토글"
                      type="button"
                    >
                      {row.useTf === "Y" ? "Y" : "N"}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-gray-500">
                    {row.regDate ? new Date(row.regDate).toLocaleString() : "-"}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      <button
                        className="px-2 py-1 text-xs rounded border hover:bg-gray-50"
                        onClick={() => alert("다음 단계: 수정 모달 연결")}
                        type="button"
                      >
                        수정
                      </button>
                      <button
                        className="px-2 py-1 text-xs rounded border text-red-600 hover:bg-red-50"
                        onClick={() => onDelete(row)}
                        type="button"
                      >
                        삭제
                      </button>
                      <button
                        className="px-2 py-1 text-xs rounded border hover:bg-gray-50"
                        onClick={() =>
                          alert(`다음 단계: 문서관리 이동 (kbSourceId=${row.id})`)
                        }
                        type="button"
                      >
                        문서관리
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        <div className="px-3 py-2 border-t text-xs text-gray-500 bg-white">
          총 <b>{totalCount}</b>건
        </div>
      </div>
    </div>
  );
}
