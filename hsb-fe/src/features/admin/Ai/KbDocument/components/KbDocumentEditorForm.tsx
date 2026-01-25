import React, { useEffect, useMemo, useState } from "react";
import type { KbDocumentRequest, KbDocumentResponse } from "../types/KbDocumentConfig";

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

export default function KbDocumentEditorForm({ value, onSubmit, onCancel }: Props) {
  const isEdit = !!value?.id;

  const [form, setForm] = useState<KbDocumentRequest>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // 파일 상태
  const [file, setFile] = useState<File | null>(null);

  // 수정일 때 기존 파일 정보 표시용
  const existingFileInfo = useMemo(() => {
    if (!value) return null;
    if (!value.originalFileName && !value.filePath) return null;
    return {
      name: value.originalFileName ?? "(파일명 없음)",
      size: value.fileSize ? formatBytes(value.fileSize) : "",
      path: value.filePath ?? "",
    };
  }, [value]);

  // value 변경 시 form 초기화
  useEffect(() => {
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
      setFile(null); // 수정 모드 진입 시 새 파일은 선택 전까지 null
    } else {
      setForm(DEFAULT_FORM);
      setFile(null);
    }
    setErr(null);
  }, [value]);

  const canSubmit = useMemo(() => {
    // 최소 요구값만 검사 (필요시 강화)
    if (!form.kbSourceId) return false;
    if (!form.title?.trim()) return false;

    // 신규 등록일 때는 file 또는 sourceUrl 중 하나는 필수로 하고 싶다면:
    // if (!isEdit && !file && !form.sourceUrl?.trim()) return false;

    return true;
  }, [form.kbSourceId, form.title, isEdit, file, form.sourceUrl]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const handleRemoveSelectedFile = () => {
    setFile(null);
  };

  const handleSubmit = async () => {
    setErr(null);

    if (!canSubmit) {
      setErr("KB Source / 제목은 필수입니다.");
      return;
    }

    // tagsJson 가 JSON 배열 문자열 형태인지 간단 검사
    try {
      if (form.tagsJson?.trim()) JSON.parse(form.tagsJson);
    } catch {
      setErr("tagsJson 형식이 올바른 JSON이 아닙니다. 예: [] 또는 [\"a\",\"b\"]");
      return;
    }

    try {
      setSaving(true);
      await onSubmit(form, file);
    } catch (e: any) {
      setErr(e?.message ?? "저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

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
          className="text-sm px-2 py-1 rounded border hover:bg-gray-50"
        >
          닫기
        </button>
      </div>

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

        {/* tagsJson */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            태그(JSON)
          </label>
          <input
            name="tagsJson"
            value={form.tagsJson ?? "[]"}
            onChange={handleChange}
            className="w-full h-10 border rounded px-2 text-sm"
            placeholder='예: ["한양대","입학처","2026"]'
          />
          <p className="mt-1 text-[11px] text-gray-400">
            JSON 배열 문자열로 저장합니다. 예: []
          </p>
        </div>

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
          className="h-10 px-4 text-sm rounded border bg-white hover:bg-gray-50"
          disabled={saving}
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="h-10 px-4 text-sm rounded bg-gray-900 text-white hover:bg-black disabled:opacity-50"
          disabled={!canSubmit || saving}
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
}
