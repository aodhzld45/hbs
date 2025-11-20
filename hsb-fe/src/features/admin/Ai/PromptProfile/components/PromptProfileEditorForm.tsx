import React, { useEffect, useState, useMemo } from "react";
import type {
  PromptProfile,
  PromptProfileRequest,
  Status,
} from "../types/promptProfileConfig";
import type { SiteKeySummary } from "../../AdminSiteKeys/types/siteKey";
import { fetchSiteKeyList, fetchLinkedSiteKeys } from "../../AdminSiteKeys/services/siteKeyApi";

type Props = {
  value?: PromptProfile | null; // 수정 시 전달, 신규는 undefined/null
  onSubmit: (data: PromptProfileRequest) => void | Promise<void>;
  onCancel: () => void;
};

const DEFAULT_MODEL = "gpt-4o-mini";

const DEFAULT_FORM: PromptProfileRequest = {
  tenantId: "",
  name: "",
  purpose: "",
  model: DEFAULT_MODEL,
  temperature: 0.7,
  topP: undefined,
  maxTokens: undefined,
  seed: undefined,
  freqPenalty: 0,
  presencePenalty: 0,
  stopJson: "",
  systemTpl: "",
  guardrailTpl: "",
  styleJson: "",
  toolsJson: "",
  policiesJson: "",
  version: 1,
  status: "DRAFT",

  // 연결할 사이트키
  linkedSiteKeyId: null,
};

export default function PromptProfileEditorForm({
  value,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<PromptProfileRequest>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);

  const [linkedTouched, setLinkedTouched] = useState(false);
  
  // 사이트키 목록 상태
  const [siteKeys, setSiteKeys] = useState<SiteKeySummary[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [keysError, setKeysError] = useState<string | null>(null);

  // 수정 모드일 때 초기값 세팅
  useEffect(() => {
    if (!value) {
      setForm(DEFAULT_FORM);
      return;
    }
    setForm({
      tenantId: value.tenantId ?? "",
      name: value.name,
      purpose: value.purpose ?? "",
      model: value.model,
      temperature: value.temperature ?? 0.7,
      topP: value.topP ?? undefined,
      maxTokens: value.maxTokens ?? undefined,
      seed: value.seed ?? undefined,
      freqPenalty: value.freqPenalty ?? 0,
      presencePenalty: value.presencePenalty ?? 0,
      stopJson: value.stopJson ?? "",
      systemTpl: value.systemTpl ?? "",
      guardrailTpl: value.guardrailTpl ?? "",
      styleJson: value.styleJson ?? "",
      toolsJson: value.toolsJson ?? "",
      policiesJson: value.policiesJson ?? "",
      version: value.version ?? 1,
      status: value.status,
      linkedSiteKeyId: value.linkedSiteKeyId ?? null,
    });
  }, [value]);

  // 사이트키 목록 로드 (ACTIVE 위주)
  useEffect(() => {
    (async () => {
      try {
        setLoadingKeys(true);
        setKeysError(null);
        const res = await fetchSiteKeyList({
          keyword: "",
          planCode: "",
          status: "ACTIVE",
          page: 0,
          size: 200,
          sort: "regDate,desc",
        });
        // API 응답 구조에 따라 content / items 이름은 맞춰주기
        setSiteKeys(res.content ?? []);
      } catch (e: any) {
        setKeysError(e?.message ?? "사이트키 조회 실패");
      } finally {
        setLoadingKeys(false);
      }
    })();
  }, []);

  // 수정 모드: 현재 프로필을 기본으로 쓰는 사이트키 자동 매핑
  useEffect(() => {
    // 1) 신규 모드면 스킵
    if (!value?.id) return;

    // 2) 사용자가 셀렉트 박스를 한 번이라도 건드렸으면 자동 매핑 안 함
    if (linkedTouched) return;

    // 3) 이미 form에 linkedSiteKeyId가 들어있으면 다시 건들지 않음
    if (form.linkedSiteKeyId != null) return;

    (async () => {
      try {
        const list = await fetchLinkedSiteKeys(value.id);

        if (!Array.isArray(list) || list.length === 0) return;

        // 우선순위: ACTIVE & delTf != 'Y' & useTf == 'Y' → 없으면 첫 번째
        const best =
          list.find(
            (k: any) =>
              k.status === "ACTIVE" && k.delTf !== "Y" && k.useTf === "Y",
          ) ?? list[0];

        setForm((prev) => ({
          ...prev,
          linkedSiteKeyId: best.id,
        }));
      } catch (e) {
        console.warn("linked siteKeys load failed", e);
      }
    })();
    // form.linkedSiteKeyId까지 넣어줘야 "이미 값 있는 경우 재실행 방지"가 정확히 동작
  }, [value?.id, linkedTouched, form.linkedSiteKeyId]);

 // Select 라벨 가독성 향상
 const siteKeyOptions = useMemo(
    () =>
    siteKeys.map((k) => ({
        value: k.id,
        label: `[${k.id}] ${k.siteKey} (${k.planCode ?? '-'}, ${k.status}${
        k.useTf === 'Y' ? '' : ', off'
        })`,
        disabled: k.status !== 'ACTIVE',
    })),
    [siteKeys]
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name === "linkedSiteKeyId") {
      setLinkedTouched(true);  // 사용자 직접 변경 플래그
      setForm((prev) => ({
        ...prev,
        linkedSiteKeyId: value === "" ? null : Number(value),
      }));
      return;
    }

    // 숫자(실수) 필드
    if (
      ["temperature", "topP", "freqPenalty", "presencePenalty"].includes(name)
    ) {
      setForm((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : Number(value),
      }));
      return;
    }

    // 숫자(정수) 필드
    if (["maxTokens", "seed", "version"].includes(name)) {
      setForm((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : Number(value),
      }));
      return;
    }

    // linkedSiteKeyId는 null 또는 number
    if (name === "linkedSiteKeyId") {
      setForm((prev) => ({
        ...prev,
        linkedSiteKeyId: value === "" ? null : Number(value),
      }));
      return;
    }

    if (name === "status") {
      setForm((prev) => ({
        ...prev,
        status: value as Status,
      }));
      return;
    }

    if (name === "useTf" || name === "delTf") {
      setForm((prev) => ({
        ...prev,
        [name]: value === "Y" ? "Y" : "N",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("프로필 이름은 필수입니다.");
      return;
    }
    if (!form.model.trim()) {
      alert("모델은 필수입니다.");
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
  };

  const modeLabel = value ? "프롬프트 프로필 수정" : "프롬프트 프로필 등록";

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <h2 className="text-base font-semibold text-gray-800">{modeLabel}</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* 기본 정보 */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              프로필 이름 *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="예: hsbs 기본 프롬프트"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Tenant ID
            </label>
            <input
              name="tenantId"
              value={form.tenantId ?? ""}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="멀티테넌트용 식별자 (옵션)"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              목적(purpose)
            </label>
            <input
              name="purpose"
              value={form.purpose ?? ""}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="예: support / sales / faq / portfolio"
            />
          </div>

          {/* 연결할 사이트키 셀렉트 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              연결할 사이트키
            </label>
            <select
              name="linkedSiteKeyId"
              value={form.linkedSiteKeyId ?? ""}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
            >
              <option value="">(선택 없음)</option>
                {siteKeyOptions.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                </option>
              ))}
            </select>
            <div className="mt-1 min-h-[16px]">
              {loadingKeys && (
                <span className="text-[11px] text-gray-400">
                  사이트키 목록 로딩 중...
                </span>
              )}
              {keysError && (
                <span className="text-[11px] text-red-500">
                  {keysError}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                사용여부
              </label>
              <select
                name="useTf"
                value={form.useTf ?? "Y"}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1 text-sm"
              >
                <option value="Y">Y</option>
                <option value="N">N</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                버전
              </label>
              <input
                name="version"
                type="number"
                min={1}
                value={form.version ?? 1}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              상태
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
            >
              <option value="DRAFT">DRAFT</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
        </div>

        {/* 모델/파라미터 */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              모델 *
            </label>
            <input
              name="model"
              value={form.model}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="gpt-4o-mini"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                temperature
              </label>
              <input
                name="temperature"
                type="number"
                step="0.1"
                min={0}
                max={1}
                value={form.temperature ?? 0.7}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                maxTokens
              </label>
              <input
                name="maxTokens"
                type="number"
                min={1}
                value={form.maxTokens ?? ""}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                freqPenalty
              </label>
              <input
                name="freqPenalty"
                type="number"
                step="0.1"
                min={-2}
                max={2}
                value={form.freqPenalty ?? 0}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                presencePenalty
              </label>
              <input
                name="presencePenalty"
                type="number"
                step="0.1"
                min={-2}
                max={2}
                value={form.presencePenalty ?? 0}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              stop 시퀀스 (JSON 문자열)
            </label>
            <input
              name="stopJson"
              value={form.stopJson ?? ""}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-xs font-mono"
              placeholder='예: ["\\nUser:", "\\nSystem:"]'
            />
          </div>
        </div>
      </div>

      {/* 시스템 / 가드레일 프롬프트 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            시스템 프롬프트(systemTpl)
          </label>
          <textarea
            name="systemTpl"
            value={form.systemTpl ?? ""}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1 text-xs font-mono min-h-[120px]"
            placeholder="예: HSBS 사이트의 AI 상담원으로서 ..."
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            가드레일/규정 프롬프트(guardrailTpl)
          </label>
          <textarea
            name="guardrailTpl"
            value={form.guardrailTpl ?? ""}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1 text-xs font-mono min-h-[120px]"
            placeholder="예: 금융/의료/법률 관련 답변 제한, 욕설 금지 등"
          />
        </div>
      </div>

      {/* 스타일/툴/정책 JSON */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            styleJson
          </label>
          <textarea
            name="styleJson"
            value={form.styleJson ?? ""}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1 text-xs font-mono min-h-[80px]"
            placeholder='예: {"lang":"ko","tone":"casual","length":"short"}'
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            toolsJson
          </label>
          <textarea
            name="toolsJson"
            value={form.toolsJson ?? ""}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1 text-xs font-mono min-h-[80px]"
            placeholder="허용 함수 목록 JSON"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            policiesJson
          </label>
          <textarea
            name="policiesJson"
            value={form.policiesJson ?? ""}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1 text-xs font-mono min-h-[80px]"
            placeholder="PII/금칙어/업종별 규정 JSON"
          />
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex justify-end gap-2 pt-2 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
          disabled={submitting}
        >
          취소
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-3 py-1.5 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? "저장 중..." : "저장"}
        </button>
      </div>
    </form>
  );
}
