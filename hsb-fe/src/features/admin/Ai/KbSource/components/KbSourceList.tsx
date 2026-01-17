import React, { useEffect, useMemo, useState } from "react";

import type { SiteKeySummary } from "../../AdminSiteKeys/types/siteKey";
import { fetchSiteKeyList } from '../../AdminSiteKeys/services/siteKeyApi';

import { useKbSourceList } from "../hooks/useKbSourceList";
import type { KbSourceResponse } from "../types/kbSourceConfig";
import { toggleKbSourceUseTf, deleteKbSourceSoft } from "../services/kbSourceApi";

export default function KbSourceList() {
  // 사이트키 목록 불러오기 
  const [siteKeys, setSiteKeys] = useState<SiteKeySummary[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [keysError, setKeysError] = useState<string | null>(null);

  // 사이트키 목록 로드 (ACTIVE 위주)
  useEffect(() => {
    (async () => {
      try {
        setLoadingKeys(true);
        setKeysError(null);
        const res = await fetchSiteKeyList({
          keyword: '',
          planCode: '',
          status: 'ACTIVE',
          page: 0,
          size: 200,
          sort: 'regDate,desc',
        });
        setSiteKeys(res.content ?? []);
      } catch (e: any) {
        setKeysError(e?.message ?? '사이트키 조회 실패');
      } finally {
        setLoadingKeys(false);
      }
    })();
  }, []);

  const siteKeyNameMap = useMemo(() => {
    const m = new Map<number, string>();
    for (const k of siteKeys as any[]) {
      m.set(k.id, k.siteKeyName ?? k.name ?? `#${k.id}`);
    }
    return m;
  }, [siteKeys]);

  // ===== KB Source 목록 훅 (params 객체 기반) =====
  const { params, setParams, data, loading, error, refetch } = useKbSourceList({
    page: 0,
    size: 20,
    sort: "regDate,desc",
  });

  // ===== actions =====
  const onSearchClick = () => {
    // 검색 클릭 시 page=0만 리셋 (params 변경으로 훅이 자동조회)
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
      refetch();
    } catch (e: any) {
      alert(e?.message || "사용여부 변경 실패");
    }
  };

  const onDelete = async (row: KbSourceResponse) => {
    if (!window.confirm(`"${row.sourceName}" 소스를 삭제(숨김) 처리할까요?`)) return;
    try {
      await deleteKbSourceSoft(row.id);
      refetch();
    } catch (e: any) {
      alert(e?.message || "삭제 실패");
    }
  };

  // ===== pagination =====
  const totalPages = data.totalPages ?? 0;
  const currentPage = params.page ?? 0;
  const canPrev = currentPage > 0;
  const canNext = totalPages > 0 && currentPage < totalPages - 1;

  return (
    <div className="p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">KB Source 관리</h2>
          <p className="text-xs text-gray-500 mt-1">
            SiteKey별 지식 묶음(Source)을 관리합니다.
          </p>
        </div>

        <button
          className="px-3 py-2 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700"
          onClick={() => alert("다음 단계: 등록/수정 모달 연결")}
        >
          신규 등록
        </button>
      </div>

      {/* 필터바 */}
      <div className="bg-white border rounded-lg p-3 mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          {/* SiteKey */}
          <div className="min-w-[220px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">
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
              className="w-full border rounded px-2 py-2 text-sm"
            >
              <option value="">전체</option>
              {(siteKeys as any[]).map((k) => (
                <option key={k.id} value={k.id}>
                  {k.siteKeyName ?? k.name ?? `#${k.id}`}
                </option>
              ))}
            </select>
            <div className="mt-1 min-h-[16px]">
              {loadingKeys && (
                <span className="text-[11px] text-gray-400">사이트키 목록 로딩 중...</span>
              )}
              {keysError && (
                <span className="text-[11px] text-red-500">{keysError}</span>
              )}
            </div>
          </div>

          {/* keyword */}
          <div className="min-w-[260px] flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
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
              className="w-full border rounded px-2 py-2 text-sm"
            />
          </div>

          {/* useTf */}
          <div className="min-w-[160px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">
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
              className="w-full border rounded px-2 py-2 text-sm"
            >
              <option value="">전체</option>
              <option value="Y">사용(Y)</option>
              <option value="N">미사용(N)</option>
            </select>
          </div>

          {/* size */}
          <div className="min-w-[120px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              페이지 크기
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
              className="w-full border rounded px-2 py-2 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* actions */}
          <div className="flex gap-2">
            <button
              className="px-3 py-2 text-sm rounded border bg-white hover:bg-gray-50"
              onClick={onResetClick}
            >
              초기화
            </button>
            <button
              className="px-3 py-2 text-sm rounded bg-gray-900 text-white hover:bg-black"
              onClick={onSearchClick}
            >
              검색
            </button>
          </div>
        </div>

        <div className="mt-2 min-h-[18px]">
          {error && <span className="text-xs text-red-500">{error}</span>}
          {loading && !error && <span className="text-xs text-gray-400">조회 중...</span>}
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="text-left px-3 py-2 w-[80px]">ID</th>
              <th className="text-left px-3 py-2 w-[160px]">SiteKey</th>
              <th className="text-left px-3 py-2">Source 이름</th>
              <th className="text-left px-3 py-2">설명</th>
              <th className="text-center px-3 py-2 w-[90px]">사용</th>
              <th className="text-left px-3 py-2 w-[180px]">등록일</th>
              <th className="text-right px-3 py-2 w-[220px]">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {!loading && (data.items?.length ?? 0) === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            )}

            {(data.items ?? []).map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-500">{row.id}</td>
                <td className="px-3 py-2">
                  {siteKeyNameMap.get(row.siteKeyId) ?? `#${row.siteKeyId}`}
                </td>
                <td className="px-3 py-2 font-medium text-gray-900">
                  {row.sourceName}
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
                    >
                      수정
                    </button>
                    <button
                      className="px-2 py-1 text-xs rounded border text-red-600 hover:bg-red-50"
                      onClick={() => onDelete(row)}
                    >
                      삭제
                    </button>
                    <button
                      className="px-2 py-1 text-xs rounded border hover:bg-gray-50"
                      onClick={() =>
                        alert(`다음 단계: 문서관리 이동 (kbSourceId=${row.id})`)
                      }
                    >
                      문서관리
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 페이징 */}
        <div className="flex items-center justify-between px-3 py-3 border-t bg-white">
          <div className="text-xs text-gray-500">
            총 <b>{data.totalCount ?? 0}</b>건 / {totalPages} 페이지
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-2 py-1 text-xs rounded border disabled:opacity-50"
              disabled={!canPrev}
              onClick={() => setParams((p) => ({ ...p, page: Math.max(0, (p.page ?? 0) - 1) }))}
            >
              이전
            </button>

            <span className="text-xs text-gray-700">
              {currentPage + 1} / {Math.max(totalPages, 1)}
            </span>

            <button
              className="px-2 py-1 text-xs rounded border disabled:opacity-50"
              disabled={!canNext}
              onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 0) + 1 }))}
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
