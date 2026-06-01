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
  onReindex: (row: KbDocumentResponse) => void;
  onRefresh: () => void;
  backgroundPolling: boolean;

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

const ACTIVE_DOC_STATUSES = new Set(["READY", "UPLOADED", "INDEXING", "DELETE_PENDING"]);
const ACTIVE_JOB_STATUSES = new Set(["READY", "RUNNING"]);
const LONG_READY_SECONDS = 5 * 60;
const LONG_RUNNING_SECONDS = 30 * 60;

function getLongRunningWarning(row: KbDocumentResponse) {
  const jobStatus = (row.latestJobStatus ?? "").toUpperCase();
  const elapsedSeconds = row.latestJobElapsedSeconds ?? 0;

  if (jobStatus === "READY" && elapsedSeconds >= LONG_READY_SECONDS) {
    return {
      label: "장시간 대기",
      message: "worker가 아직 작업을 집지 못했습니다. 새로고침 후 계속 유지되면 worker 상태를 확인하세요.",
    };
  }

  if (jobStatus === "RUNNING" && elapsedSeconds >= LONG_RUNNING_SECONDS) {
    return {
      label: "장시간 처리 중",
      message: "분석 작업이 오래 실행 중입니다. Brain/FastAPI 또는 외부 API 응답 지연 가능성이 있습니다.",
    };
  }

  return null;
}

function getStatusTone(row: KbDocumentResponse) {
  const docStatus = (row.docStatus ?? "").toUpperCase();
  const jobStatus = (row.latestJobStatus ?? "").toUpperCase();

  if (docStatus === "FAILED" || jobStatus === "FAILED") {
    return "bg-red-50 border-red-200 text-red-700";
  }
  if (docStatus === "INDEXED" || jobStatus === "SUCCESS") {
    return "bg-emerald-50 border-emerald-200 text-emerald-700";
  }
  if (getLongRunningWarning(row)) {
    return "bg-amber-50 border-amber-200 text-amber-700";
  }
  if (ACTIVE_DOC_STATUSES.has(docStatus) || ACTIVE_JOB_STATUSES.has(jobStatus)) {
    return "bg-blue-50 border-blue-200 text-blue-700";
  }
  return "bg-white border-gray-200 text-gray-700";
}

function isActiveJob(row: KbDocumentResponse) {
  const docStatus = (row.docStatus ?? "").toUpperCase();
  const jobStatus = (row.latestJobStatus ?? "").toUpperCase();
  return ACTIVE_DOC_STATUSES.has(docStatus) || ACTIVE_JOB_STATUSES.has(jobStatus);
}

function getJobStatusLabel(row: KbDocumentResponse) {
  const jobStatus = row.latestJobStatus;
  if (!jobStatus) return null;
  const jobType = row.latestJobType ? `${row.latestJobType} ` : "";
  return `${jobType}${jobStatus}`;
}

function formatDuration(seconds?: number | null) {
  if (seconds == null || Number.isNaN(seconds)) return null;
  const safe = Math.max(0, Math.floor(seconds));
  if (safe < 60) return `${safe}초`;

  const minutes = Math.floor(safe / 60);
  const remainSeconds = safe % 60;
  if (minutes < 60) {
    return remainSeconds > 0 ? `${minutes}분 ${remainSeconds}초` : `${minutes}분`;
  }

  const hours = Math.floor(minutes / 60);
  const remainMinutes = minutes % 60;
  return remainMinutes > 0 ? `${hours}시간 ${remainMinutes}분` : `${hours}시간`;
}

function getElapsedLabel(row: KbDocumentResponse) {
  const status = (row.latestJobStatus ?? "").toUpperCase();
  const elapsed = formatDuration(row.latestJobElapsedSeconds);
  const duration = formatDuration(row.latestJobDurationSeconds);

  if (status === "READY" && elapsed) return `대기 ${elapsed}`;
  if (status === "RUNNING" && elapsed) return `처리 ${elapsed}`;
  if (status === "SUCCESS" && duration) return `완료 소요 ${duration}`;
  if (status === "FAILED" && elapsed) return `실패 전 ${elapsed}`;
  return null;
}

function getEstimateLabel(row: KbDocumentResponse) {
  const min = formatDuration(row.estimatedDurationMinSeconds);
  const max = formatDuration(row.estimatedDurationMaxSeconds);
  if (!min || !max) return null;

  const hasAverage = !!row.averageJobDurationSeconds;
  const prefix = hasAverage ? "평균 기준" : "파일 기준";
  return `${prefix} 보통 ${min}~${max}`;
}

function getProgressPercent(row: KbDocumentResponse) {
  const raw = row.latestJobProgressPercent;
  if (raw == null || Number.isNaN(raw)) return null;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

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
  onReindex,
  onRefresh,
  backgroundPolling,
  docTypeOptions = DEFAULT_DOC_TYPE_OPTIONS,
  docStatusOptions = DEFAULT_DOC_STATUS_OPTIONS,
  categoryOptions = [{ value: "", label: "전체" }],
}: Props) {
  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const activeCount = items.filter(isActiveJob).length;
  const longRunningCount = items.filter((item) => !!getLongRunningWarning(item)).length;

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
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-gray-500">
          {activeCount > 0 ? (
            <span className="inline-flex items-center gap-2 rounded border border-blue-100 bg-blue-50 px-3 py-2 text-blue-700">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-300 border-t-transparent" />
              백그라운드 분석 {activeCount}건 진행 중
            </span>
          ) : (
            <span className="inline-flex rounded border border-gray-100 bg-gray-50 px-3 py-2 text-gray-500">
              진행 중인 분석 작업 없음
            </span>
          )}
          {backgroundPolling && (
            <span className="ml-2 text-[11px] text-gray-400">상태 자동 갱신 중</span>
          )}
          {longRunningCount > 0 && (
            <span className="ml-2 inline-flex rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-700">
              장시간 작업 {longRunningCount}건
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="h-10 px-3 text-sm rounded border bg-white hover:bg-gray-50"
            onClick={onRefresh}
            type="button"
          >
            새로고침
          </button>
        <button
          className="h-10 px-3 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700"
          onClick={onOpenCreate}
          type="button"
        >
          신규 등록
        </button>
        </div>
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

          {/* 문서 제목 검색 (title LIKE) */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1 h-4">
              문서 제목
            </label>
            <input
              value={params.keyword ?? ""}
              onChange={(e) => setParams((p) => ({ ...p, keyword: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSearchClick();
              }}
              placeholder="문서 제목으로 검색"
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
                    <div className="space-y-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs border ${getStatusTone(row)}`}>
                        {isActiveJob(row) && (
                          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
                        )}
                        {docStatusLabel.get(row.docStatus) ?? row.docStatus ?? "-"}
                      </span>
                      {getJobStatusLabel(row) && (
                        <div className="text-[11px] text-gray-500">
                          Job: {getJobStatusLabel(row)}
                        </div>
                      )}
                      {row.latestJobProgressStage && (
                        <div className="text-[11px] text-gray-500">
                          {row.latestJobProgressStage}
                        </div>
                      )}
                      {getProgressPercent(row) != null && (
                        <div className="h-1.5 w-[150px] overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={`h-full rounded-full ${
                              row.latestJobStatus === "FAILED" ? "bg-red-400" : "bg-blue-500"
                            }`}
                            style={{ width: `${getProgressPercent(row)}%` }}
                          />
                        </div>
                      )}
                      {getElapsedLabel(row) && (
                        <div className="text-[11px] text-gray-600">
                          {getElapsedLabel(row)}
                        </div>
                      )}
                      {getLongRunningWarning(row) && (
                        <div
                          className="max-w-[190px] rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-700"
                          title={getLongRunningWarning(row)?.message}
                        >
                          {getLongRunningWarning(row)?.label}
                        </div>
                      )}
                      {isActiveJob(row) && getEstimateLabel(row) && (
                        <div className="text-[11px] text-gray-400">
                          {getEstimateLabel(row)}
                        </div>
                      )}
                      {row.latestJobLastError && (
                        <div className="max-w-[180px] truncate text-[11px] text-red-600" title={row.latestJobLastError}>
                          {row.latestJobLastError}
                        </div>
                      )}
                    </div>
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
                      {(row.docStatus === "FAILED" || row.latestJobStatus === "FAILED") && (
                        <button
                          className="px-2 py-1 text-xs rounded border text-blue-600 hover:bg-blue-50"
                          onClick={() => onReindex(row)}
                          type="button"
                        >
                          재분석
                        </button>
                      )}
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
