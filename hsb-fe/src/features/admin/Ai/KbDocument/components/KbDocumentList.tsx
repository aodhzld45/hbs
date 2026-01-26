import React, { useMemo } from "react";

import type {
  KbDocumentListResponse,
  KbDocumentResponse,
} from "../types/KbDocumentConfig";

type KbDocumentListParams = {
  kbSourceId?: number;
  docType?: string;
  docStatus?: string;
  category?: string;
  keyword?: string;
  useTf?: "Y" | "N";
  page?: number;
  size?: number;
  sort?: string;
};

type Option = { value: string; label: string; disabled?: boolean };

type Props = {
  params: KbDocumentListParams;
  setParams: React.Dispatch<React.SetStateAction<KbDocumentListParams>>;

  data: KbDocumentListResponse; // useKbDocumentList에서 기본값 객체를 반환한다고 가정
  loading: boolean;
  error: string | null;

  onOpenCreate: () => void;
  onOpenEdit: (row: KbDocumentResponse) => void;
  onToggleUse: (row: KbDocumentResponse) => void;
  onClickDelete: (row: KbDocumentResponse) => void;

  // 옵션은 상위에서 주입(권장) 또는 기본값 사용
  docTypeOptions?: Option[];
  docStatusOptions?: Option[];
  categoryOptions?: Option[];
};

const DEFAULT_DOC_TYPE_OPTIONS: Option[] = [
  { value: "", label: "전체" },
  { value: "PDF", label: "PDF" },
  { value: "DOC", label: "DOC" },
  { value: "DOCX", label: "DOCX" },
  { value: "HWP", label: "HWP" },
  { value: "TXT", label: "TXT" },
  { value: "URL", label: "URL" },
];

const DEFAULT_DOC_STATUS_OPTIONS: Option[] = [
  { value: "", label: "전체" },
  { value: "DRAFT", label: "초안" },
  { value: "UPLOADED", label: "업로드" },
  { value: "INDEXING", label: "인덱싱중" },
  { value: "INDEXED", label: "인덱싱완료" },
  { value: "FAILED", label: "실패" },
];

export default function KbDocumentList({
  params,
  setParams,
  data,
  loading,
  error,
  onOpenCreate,
  onOpenEdit,
  onToggleUse,
  onClickDelete,
  docTypeOptions = DEFAULT_DOC_TYPE_OPTIONS,
  docStatusOptions = DEFAULT_DOC_STATUS_OPTIONS,
  categoryOptions = [{ value: "", label: "전체" }],
}: Props) {
  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  const docTypeLabel = useMemo(() => {
    const m = new Map<string, string>();
    for (const o of docTypeOptions) m.set(o.value, o.label);
    return m;
  }, [docTypeOptions]);

  const docStatusLabel = useMemo(() => {
    const m = new Map<string, string>();
    for (const o of docStatusOptions) m.set(o.value, o.label);
    return m;
  }, [docStatusOptions]);

  const onSearchClick = () => setParams((p) => ({ ...p, page: 0 }));

  const onResetClick = () => {
    setParams(() => ({
      kbSourceId: undefined,
      docType: "",
      docStatus: "",
      category: "",
      keyword: "",
      useTf: undefined,
      page: 0,
      size: 20,
      sort: "regDate,desc",
    }));
  };

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
          {/* kbSourceId */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1 h-4">
              KB Source ID
            </label>
            <input
              value={params.kbSourceId ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setParams((p) => ({
                  ...p,
                  kbSourceId: v ? Number(v) : undefined,
                  page: 0,
                }));
              }}
              placeholder="예: 12"
              className="w-full h-10 border rounded px-2 text-sm"
            />
            <div className="mt-1 h-4" />
          </div>

          {/* docType */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1 h-4">
              문서 타입
            </label>
            <select
              value={params.docType ?? ""}
              onChange={(e) =>
                setParams((p) => ({ ...p, docType: e.target.value, page: 0 }))
              }
              className="w-full h-10 border rounded px-2 text-sm bg-white"
            >
              {docTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="mt-1 h-4" />
          </div>

          {/* docStatus */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1 h-4">
              상태
            </label>
            <select
              value={params.docStatus ?? ""}
              onChange={(e) =>
                setParams((p) => ({ ...p, docStatus: e.target.value, page: 0 }))
              }
              className="w-full h-10 border rounded px-2 text-sm bg-white"
            >
              {docStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="mt-1 h-4" />
          </div>

          {/* category */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1 h-4">
              카테고리
            </label>
            <select
              value={params.category ?? ""}
              onChange={(e) =>
                setParams((p) => ({ ...p, category: e.target.value, page: 0 }))
              }
              className="w-full h-10 border rounded px-2 text-sm bg-white"
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="mt-1 h-4" />
          </div>

          {/* keyword */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1 h-4">
              키워드
            </label>
            <input
              value={params.keyword ?? ""}
              onChange={(e) => setParams((p) => ({ ...p, keyword: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSearchClick();
              }}
              placeholder="제목/파일명/URL"
              className="w-full h-10 border rounded px-2 text-sm"
            />
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
              <th className="text-left px-3 py-2 w-[120px]">KB Source</th>
              <th className="text-left px-3 py-2">제목</th>
              <th className="text-left px-3 py-2 w-[220px]">원본 파일명</th>
              <th className="text-left px-3 py-2 w-[120px]">타입</th>
              <th className="text-left px-3 py-2 w-[140px]">상태</th>
              <th className="text-center px-3 py-2 w-[90px]">사용</th>
              <th className="text-left px-3 py-2 w-[180px]">등록일</th>
              <th className="text-right px-3 py-2 w-[220px]">액션</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading && (
              <tr>
                <td colSpan={9} className="px-3 py-10 text-center text-gray-400">
                  조회 중...
                </td>
              </tr>
            )}

            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-10 text-center text-gray-400">
                  데이터가 없습니다.
                </td>
              </tr>
            )}

            {!loading &&
              items.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-500">{row.id}</td>

                  <td className="px-3 py-2 text-gray-700">{row.kbSourceId}</td>

                  <td className="px-3 py-2 font-medium text-gray-900">
                    <span className="block truncate max-w-[520px]">{row.title}</span>
                    {row.sourceUrl && (
                      <span className="block text-xs text-gray-500 truncate max-w-[520px]">
                        {row.sourceUrl}
                      </span>
                    )}
                  </td>

                  <td className="px-3 py-2 text-gray-700">
                    <span className="block truncate max-w-[220px]">
                      {row.originalFileName || "-"}
                    </span>
                    <span className="block text-xs text-gray-500">
                      {row.fileSize ? `${(row.fileSize / 1024).toFixed(1)} KB` : ""}
                    </span>
                  </td>

                  <td className="px-3 py-2 text-gray-700">
                    {docTypeLabel.get(row.docType) ?? row.docType ?? "-"}
                  </td>

                  <td className="px-3 py-2">
                    <span className="inline-flex px-2 py-1 rounded text-xs border bg-white text-gray-700">
                      {docStatusLabel.get(row.docStatus) ?? row.docStatus ?? "-"}
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
                        onClick={() => onOpenEdit(row)}
                        type="button"
                      >
                        수정
                      </button>
                      <button
                        className="px-2 py-1 text-xs rounded border text-red-600 hover:bg-red-50"
                        onClick={() => onClickDelete(row)}
                        type="button"
                      >
                        삭제
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
