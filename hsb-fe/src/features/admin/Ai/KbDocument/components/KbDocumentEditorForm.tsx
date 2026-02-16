import React, { useEffect, useMemo, useRef, useState } from "react";
import type { KbDocumentRequest, KbDocumentResponse } from "../types/KbDocumentConfig";
import { fetchKbDocumentDetail } from "../services/KbDocumentApi";

type Props = {
  value?: KbDocumentResponse | null; // 수정이면 값 주입
  onSubmit: (data: KbDocumentRequest, file?: File | null) => void | Promise<void>;
  onCancel: () => void;

  // 옵션: 필요하면 문서 타입/상태 목록을 props로 받을 수도 있음
  // docTypeOptions?: { value: string; label: string }[];
  // docStatusOptions?: { value: string; label: string }[];
};

const DEFAULT_FORM: KbDocumentRequest = {
  kbSourceId: 0,
  title: "",
  docType: "FILE",      // 프로젝트 기본값에 맞게 조정
  docStatus: "DRAFT",   // 기본값
  category: "",
  sourceUrl: "",
  tagsJson: "[]",
  useTf: "Y",
  delTf: "N",
  // version 등 서버에서 관리하는 값이 있다면 Request에서 제외하는 게 보통입니다.
};

function formatBytes(bytes?: number) {
  if (!bytes || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

type ProgressStep = 0 | 1 | 2 | 3 | 99;
// 0: idle, 1: 업로드/attach 중, 2: 해독/요약 생성 중, 3: 완료, 99: 실패

function stepLabel(step: ProgressStep) {
  switch (step) {
    case 1:
      return "1. 벡터스토어에 문서 업로드중...";
    case 2:
      return "2. 문서 해독해서 답변(요약) 생성 중...";
    case 3:
      return "3. 완료! 아래에서 답변(요약)을 확인하세요.";
    case 99:
      return "처리 실패";
    default:
      return "";
  }
}

export default function KbDocumentEditorForm({ value, onSubmit, onCancel }: Props) {
  const isEdit = !!value?.id;

  const [form, setForm] = useState<KbDocumentRequest>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // 파일 상태
  const [file, setFile] = useState<File | null>(null);

  // 진행 상태(폴링 기반)
  const [progressStep, setProgressStep] = useState<ProgressStep>(0);
  const [progressText, setProgressText] = useState<string>("");
  const [liveDetail, setLiveDetail] = useState<KbDocumentResponse | null>(null);
  const [polling, setPolling] = useState(false);
  const [lockedAfterDone, setLockedAfterDone] = useState(false);

  const pollTimerRef = useRef<number | null>(null);
  const pollStartRef = useRef<number>(0);

  const detail = liveDetail ?? value ?? null;

  const canSubmit = useMemo(() => {
    if (!form.kbSourceId) return false;
    if (!form.title?.trim()) return false;
    return true;
  }, [form.kbSourceId, form.title]);

  const isIndexing = progressStep === 1 || progressStep === 2;
  const isProcessing = saving || polling || isIndexing;

  // 수정일 때 기존 파일 정보 표시용
  const existingFileInfo = useMemo(() => {
    const v = detail;   // value -> detail로 변경
    if (!v) return null;
    if (!v.originalFileName && !v.filePath) return null;
    return {
      name: v.originalFileName ?? "(파일명 없음)",
      size: v.fileSize ? formatBytes(v.fileSize) : "",
      path: v.filePath ?? "",
    };
  }, [detail]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  
    if (f) {
      setLockedAfterDone(false); // 다시 저장 가능
      setProgressStep(0);
      setProgressText("");
    }
  };

  // value 변경 시 form 초기화
  useEffect(() => {
    setLockedAfterDone(false);   // 문서 바뀌면 잠금 초기화

    if (value) {
      setForm({
        kbSourceId: value.kbSourceId,
        title: value.title ?? "",
        docType: value.docType ?? "FILE",
        docStatus: value.docStatus ?? "DRAFT",
        category: value.category ?? "",
        sourceUrl: value.sourceUrl ?? "",
        tagsJson: value.tagsJson ?? "[]",
        useTf: value.useTf ?? "Y",
        delTf: value.delTf ?? "N",
      });
      setFile(null);
      setLiveDetail(value); // value를 liveDetail로 시작
    } else {
      setForm(DEFAULT_FORM);
      setFile(null);
      setLiveDetail(null);
    }
    setErr(null);
    setProgressStep(0);
    setProgressText("");
    stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.id]); // id 기준으로 바뀔 때만

  useEffect(() => {
    if (!value) return;
    const step = computeStepFromDetail(value);
    if (step === 3) setLockedAfterDone(true); // 기존에 이미 완료된 문서면 잠금
  }, [value?.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "kbSourceId"
          ? Number(value)
          : value,
    }));
  };

  const handleRemoveSelectedFile = () => {
    setFile(null);
  };

  // 단계 추정 로직 (DB 필드 변화 기반)
  const computeStepFromDetail = (d: KbDocumentResponse | null): ProgressStep => {
    if (!d) return 0;
  
    const status = (d.docStatus ?? "").toUpperCase();
  
    // 인덱싱 진행은 INDEXING일 때만
    if (status !== "INDEXING") {
      // 완료 상태면 3
      if (status === "INDEXED" && (d.indexSummary?.trim() || d.indexedAt)) return 3;
      if (status === "FAILED" && d.indexError?.trim()) return 99;
      return 0;
    }
  
    // INDEXING 상태일 때만 진행 단계
    if (d.indexError?.trim()) return 99;
    if (d.indexSummary?.trim() || d.indexedAt) return 3;
    if (d.vectorFileId?.trim()) return 2;
    return 1;
  };

  const refreshDetailOnce = async () => {
    if (!detail?.id) return;
    const fresh = await fetchKbDocumentDetail(detail.id);
    setLiveDetail(fresh);

    const step = computeStepFromDetail(fresh);
    setProgressStep(step);
    setProgressText(stepLabel(step));
  };

  const stopPolling = () => {
    if (pollTimerRef.current) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    setPolling(false);
  };

  const startPolling = () => {
    if (!detail?.id) return;

    stopPolling();
    setPolling(true);
    pollStartRef.current = Date.now();

    // 처음 1회 바로
    refreshDetailOnce().catch(() => {});

    pollTimerRef.current = window.setInterval(async () => {
      try {
        // 10분 타임아웃(원하면 조정)
        const elapsed = Date.now() - pollStartRef.current;
        if (elapsed > 10 * 60 * 1000) {
          stopPolling();
          setProgressText("처리가 오래 걸리고 있습니다. 잠시 후 '새로고침'을 눌러 확인해주세요.");
          return;
        }

        const fresh = await fetchKbDocumentDetail(detail.id!);
        setLiveDetail(fresh);

        const step = computeStepFromDetail(fresh);
        setProgressStep(step);
        setProgressText(stepLabel(step));

        // 완료/실패면 폴링 중지
        if (step === 3 || step === 99) {
          stopPolling();
        }
      } catch (e) {
        // 네트워크 순간 오류는 조용히 유지
      }
    }, 2000);
  };

  // 편의: edit 모드에서, 문서가 아직 완료가 아니면 자동 폴링
  useEffect(() => {
    if (!detail?.id) return;

    const step = computeStepFromDetail(detail);
    setProgressStep(step);
    setProgressText(stepLabel(step));

    // 이미 완료/실패면 폴링 불필요
    // step 0(진행아님)도 자동 폴링 금지
    if (step === 0 || step === 3 || step === 99) return;
      // 자동 시작
      startPolling();

    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail?.id]);

  useEffect(() => {
    if (progressStep === 3 && detail) {
      setForm((prev) => ({
        ...prev,
        tagsJson: detail.tagsJson?.trim() ? detail.tagsJson : "[]",
      }));
    }
  }, [progressStep, detail?.tagsJson]);

  useEffect(() => {
    if (progressStep === 3) {
      setLockedAfterDone(true);
      setFile(null); // 완료되면 선택 파일 제거(안전장치)
    }
  }, [progressStep]);

  const handleSubmit = async () => {
    setErr(null);

    if (!canSubmit) {
      setErr("KB Source / 제목은 필수입니다.");
      return;
    }

    try {
      setSaving(true);
      await onSubmit(form, file);
 
      if (detail?.id) {
        startPolling();
      }
    } catch (e: any) {
      setErr(e?.message ?? "저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const summaryText = detail?.indexSummary ?? "";
  const tagsJson = detail?.tagsJson?.trim() ? detail.tagsJson : "[]";

  const tags: string[] = (() => {
    try {
      const arr = JSON.parse(tagsJson);
      return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
    } catch {
      return [];
    }
  })();

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold">
          {isEdit ? "KB Document 수정" : "KB Document 신규 등록"}
        </div>
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="text-sm px-2 py-1 rounded border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          닫기
        </button>
      </div>

      {/* 진행 상태 카드 (edit + 인덱싱 진행중일 때 유용) */}
      {detail?.id && (
        <div className="rounded border bg-gray-50 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-semibold text-gray-700">
                인덱싱 진행 상태
              </div>

              {progressStep === 99 ? (
                <div className="mt-1 text-sm text-red-700">
                  처리 실패: {detail.indexError}
                </div>
              ) : progressStep === 3 ? (
                <div className="mt-1 text-sm text-green-700">
                  {progressText || "완료"}
                </div>
              ) : progressStep === 0 ? (
                <div className="mt-1 text-sm text-gray-600">
                  상태 확인 대기 중...
                </div>
              ) : (
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-700">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                  <span>{progressText}</span>
                </div>
              )}

              <div className="mt-1 text-[11px] text-gray-500">
                {polling ? "상태를 자동으로 확인 중입니다." : "상태 확인이 멈췄습니다."}
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-2">
              <button
                type="button"
                onClick={() => startPolling()}
                className="text-xs px-2 py-1 rounded border bg-white hover:bg-gray-50"
                disabled={!detail?.id}
              >
                자동 확인
              </button>
              <button
                type="button"
                onClick={() => refreshDetailOnce()}
                className="text-xs px-2 py-1 rounded border bg-white hover:bg-gray-50"
                disabled={!detail?.id}
              >
                새로고침
              </button>
              <button
                type="button"
                onClick={() => stopPolling()}
                className="text-xs px-2 py-1 rounded border bg-white hover:bg-gray-50"
              >
                중지
              </button>
            </div>
          </div>

          {/* 결과(요약) 표시 */}
          {progressStep === 3 && summaryText?.trim() && (
            <div className="mt-3">
              <div className="text-xs font-semibold text-gray-700 mb-1">
                AI 요약 결과 (index_summary)
              </div>
              <div className="rounded border bg-white p-3 text-sm whitespace-pre-wrap">
                {summaryText}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 폼 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* kbSourceId */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            KB Source ID <span className="text-red-500">*</span>
          </label>
          <input
            name="kbSourceId"
            type="number"
            value={form.kbSourceId || ""}
            onChange={handleChange}
            className="w-full h-10 border rounded px-2 text-sm"
            placeholder="예: 12"
          />
          <p className="mt-1 text-[11px] text-gray-400">
            문서는 특정 KB Source에 귀속됩니다. (일단 ID 입력 방식)
          </p>
        </div>

        {/* useTf */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            사용여부
          </label>
          <select
            name="useTf"
            value={form.useTf ?? "Y"}
            onChange={handleChange}
            className="w-full h-10 border rounded px-2 text-sm bg-white"
          >
            <option value="Y">사용(Y)</option>
            <option value="N">미사용(N)</option>
          </select>
          <p className="mt-1 text-[11px] text-gray-400">
            사용여부는 챗봇/RAG에서 조회 가능 여부에 활용됩니다.
          </p>
        </div>

        {/* title */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            value={form.title ?? ""}
            onChange={handleChange}
            className="w-full h-10 border rounded px-2 text-sm"
            placeholder="예: 2026학년도 학교장추천 시스템 안내"
          />
        </div>

        {/* docType */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            문서 타입
          </label>
          <select
            name="docType"
            value={form.docType ?? "FILE"}
            onChange={handleChange}
            className="w-full h-10 border rounded px-2 text-sm bg-white"
          >
            <option value="FILE">FILE</option>
            <option value="URL">URL</option>
            <option value="TEXT">TEXT</option>
          </select>
        </div>

        {/* docStatus */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            상태
          </label>
          <select
            name="docStatus"
            value={form.docStatus ?? "DRAFT"}
            onChange={handleChange}
            className="w-full h-10 border rounded px-2 text-sm bg-white"
          >
            <option value="DRAFT">DRAFT</option>
            <option value="READY">READY</option>
            <option value="INDEXED">INDEXED</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>

        {/* category */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            카테고리
          </label>
          <input
            name="category"
            value={form.category ?? ""}
            onChange={handleChange}
            className="w-full h-10 border rounded px-2 text-sm"
            placeholder="예: 입학/전형/학교장추천"
          />
        </div>

        {/* sourceUrl */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            원본 URL (선택)
          </label>
          <input
            name="sourceUrl"
            value={form.sourceUrl ?? ""}
            onChange={handleChange}
            className="w-full h-10 border rounded px-2 text-sm"
            placeholder="https://..."
          />
        </div>

        {/* 결과(태그) 표시 */}
        {progressStep === 3 && (
          <div className="md:col-span-2">
            <div className="text-xs font-semibold text-gray-700 mb-1">
              AI 태그 결과 (tags_json)
            </div>

            <div className="flex flex-wrap gap-2 rounded border bg-white p-3">
              {tags.length > 0 ? (
                tags.map((t) => (
                  <span key={t} className="px-2 py-1 text-xs rounded-full border bg-gray-50">
                    #{t}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">생성된 태그가 없습니다.</span>
              )}
            </div>
          </div>
        )}

        {/* 파일 업로드 */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            파일 업로드 (선택)
          </label>

          {/* 기존 파일 표시 (수정 모드) */}
          {existingFileInfo && (
            <div className="mb-2 rounded border bg-gray-50 px-3 py-2 text-xs text-gray-700">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium truncate">
                    기존 파일: {existingFileInfo.name}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate">
                    {existingFileInfo.size ? `크기: ${existingFileInfo.size} · ` : ""}
                    {existingFileInfo.path}
                  </div>
                </div>
                <div className="text-[11px] text-gray-500">
                  {file ? "새 파일로 교체 예정" : "유지"}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm"
              accept=".pdf,.txt,.md,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.json"
            />

            {/* 선택된 파일 표시 */}
            {file && (
              <div className="flex items-center justify-between rounded border px-3 py-2 text-xs">
                <div className="min-w-0">
                  <div className="font-medium truncate">{file.name}</div>
                  <div className="text-[11px] text-gray-500">
                    {formatBytes(file.size)} · {file.type || "unknown"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveSelectedFile}
                  className="ml-3 px-2 py-1 rounded border hover:bg-gray-50"
                >
                  제거
                </button>
              </div>
            )}

            <p className="text-[11px] text-gray-400">
              저장 시 body(JSON) + file(multipart)로 전송됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* 에러 */}
      {err && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
          {err}
        </div>
      )}

      {/* 액션 */}
      <div className="flex justify-end gap-2 pt-2 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="h-10 px-4 text-sm rounded border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          취소
        </button>

        {!lockedAfterDone && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || saving || isProcessing}
            className="h-10 px-4 text-sm rounded bg-gray-900 text-white hover:bg-black disabled:opacity-50"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        )}
        {lockedAfterDone && (
          <button
            type="button"
            onClick={onCancel}
            className="h-10 px-4 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700"
          >
            완료 · 닫기
          </button>
        )}
      </div>
    </div>
  );
}
