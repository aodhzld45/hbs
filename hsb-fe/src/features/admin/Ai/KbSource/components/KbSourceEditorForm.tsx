import React, { useEffect, useMemo, useState } from "react";
import type { KbSourceRequest, KbSourceResponse } from "../types/kbSourceConfig";

type SiteKeyOption = { value: number; label: string; disabled?: boolean };

type Props = {
  value?: KbSourceResponse | null; // 수정이면 값 주입
  siteKeyOptions: SiteKeyOption[];
  onSubmit: (data: KbSourceRequest) => void | Promise<void>;
  onCancel: () => void;
};

const DEFAULT_FORM: KbSourceRequest = {
  siteKeyId: 0,
  sourceName: "",
  description: "",
  useTf: "Y",
  delTf: "N",
};

export default function KbSourceEditorForm({
  value,
  siteKeyOptions,
  onSubmit,
  onCancel,
}: Props) {
  const isEdit = !!value?.id;

  const [form, setForm] = useState<KbSourceRequest>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (value) {
      setForm({
        siteKeyId: value.siteKeyId,
        sourceName: value.sourceName ?? "",
        description: value.description ?? "",
        useTf: value.useTf ?? "Y",
        delTf: value.delTf ?? "N",
      });
    } else {
      setForm(DEFAULT_FORM);
    }
  }, [value]);

  const canSubmit = useMemo(() => {
    return !!form.siteKeyId && !!form.sourceName?.trim();
  }, [form.siteKeyId, form.sourceName]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({
      ...p,
      [name]: name === "siteKeyId" ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    setErr(null);
    if (!canSubmit) {
      setErr("SiteKey와 Source 이름은 필수입니다.");
      return;
    }
    try {
      setSaving(true);
      await onSubmit(form);
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
          {isEdit ? "KB Source 수정" : "KB Source 신규 등록"}
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
        {/* siteKeyId */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Site Key <span className="text-red-500">*</span>
          </label>
          <select
            name="siteKeyId"
            value={form.siteKeyId || ""}
            onChange={handleChange}
            className="w-full h-10 border rounded px-2 text-sm bg-white"
            disabled={isEdit} // 수정 시 siteKey 변경 막고 싶으면 true
          >
            <option value="">(선택)</option>
            {siteKeyOptions.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-gray-400">
            지식 소스는 특정 SiteKey에 귀속됩니다.
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
        </div>

        {/* sourceName */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Source 이름 <span className="text-red-500">*</span>
          </label>
          <input
            name="sourceName"
            value={form.sourceName ?? ""}
            onChange={handleChange}
            className="w-full h-10 border rounded px-2 text-sm"
            placeholder="예: 인사규정 / FAQ / 업무매뉴얼"
          />
        </div>

        {/* description */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            설명
          </label>
          <textarea
            name="description"
            value={form.description ?? ""}
            onChange={handleChange}
            className="w-full min-h-[90px] border rounded px-2 py-2 text-sm"
            placeholder="이 소스가 어떤 문서/지식인지 간단히 설명"
          />
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
