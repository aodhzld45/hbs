import React, { useEffect, useState, useMemo } from "react";
import type {
  PromptProfile,
  PromptProfileRequest,
  Status,
} from "../types/promptProfileConfig";

import { WelcomeBlock } from "../types/welcomeBlockConfig";
import { blocksToWelcomeJson, collectFilesFromBlocks, welcomeJsonToBlocks } from "../utils/welcomeBlocksMapper";
import { WelcomeBlocksEditor } from "./WelcomeBlocksEditor";

import type { SiteKeySummary } from "../../AdminSiteKeys/types/siteKey";
import {
  fetchSiteKeyList,
  fetchLinkedSiteKeys,
} from "../../AdminSiteKeys/services/siteKeyApi";

type Props = {
  value?: PromptProfile | null; // 수정 시 전달, 신규는 undefined/null
  onSubmit: (data: PromptProfileRequest, files?: File[]) => void | Promise<void>;
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
  welcomeBlocksJson: "",
  styleJson: "",
  toolsJson: "",
  policiesJson: "",
  version: 1,
  status: "DRAFT",

  // 연결할 사이트키
  linkedSiteKeyId: null,

  // 공통 플래그
  useTf: "Y",
  delTf: "N",
};

type ErrorMap = Partial<Record<keyof PromptProfileRequest | "_global", string>>;

export default function PromptProfileEditorForm({
  value,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<PromptProfileRequest>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<ErrorMap>({});

  const [linkedTouched, setLinkedTouched] = useState(false);
  const [welcomeBlocks, setWelcomeBlocks] = useState<WelcomeBlock[]>([]);


  // 사이트키 목록 상태
  const [siteKeys, setSiteKeys] = useState<SiteKeySummary[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [keysError, setKeysError] = useState<string | null>(null);

  // ==== 유효성 검사 ====
  const validate = (f: PromptProfileRequest): ErrorMap => {
    const err: ErrorMap = {};

    // name: @NotBlank, @Size(max=100)
    if (!f.name || !f.name.trim()) {
      err.name = "프로필 이름은 필수입니다.";
    } else if (f.name.trim().length > 100) {
      err.name = "프로필 이름은 최대 100자까지 가능합니다.";
    }

    // tenantId: @Size(max=64)
    if (f.tenantId && f.tenantId.length > 64) {
      err.tenantId = "Tenant ID는 최대 64자까지 가능합니다.";
    }

    // purpose: @Size(max=40)
    if (f.purpose && f.purpose.length > 40) {
      err.purpose = "목적(purpose)은 최대 40자까지 가능합니다.";
    }

    // model: @NotBlank, @Size(max=60)
    if (!f.model || !f.model.trim()) {
      err.model = "모델은 필수입니다.";
    } else if (f.model.trim().length > 60) {
      err.model = "모델 이름은 최대 60자까지 가능합니다.";
    }

    // temperature: @NotNull, 0.0 ~ 1.0
    if (f.temperature === null || f.temperature === undefined) {
      err.temperature = "temperature는 필수입니다.";
    } else if (isNaN(Number(f.temperature))) {
      err.temperature = "temperature 값이 올바르지 않습니다.";
    } else if (Number(f.temperature) < 0 || Number(f.temperature) > 1) {
      err.temperature = "temperature는 0.0 이상 1.0 이하로 입력해주세요.";
    }

    // topP: 0.0 ~ 1.0 (옵션)
    if (f.topP !== null && f.topP !== undefined) {
      if (isNaN(Number(f.topP))) {
        err.topP = "topP 값이 올바르지 않습니다.";
      } else if (Number(f.topP) < 0 || Number(f.topP) > 1) {
        err.topP = "topP는 0.0 이상 1.0 이하로 입력해주세요.";
      }
    }

    // maxTokens: @Min(1) (옵션)
    if (f.maxTokens !== null && f.maxTokens !== undefined) {
      if (Number.isNaN(Number(f.maxTokens))) {
        err.maxTokens = "maxTokens 값이 올바르지 않습니다.";
      } else if (Number(f.maxTokens) < 1) {
        err.maxTokens = "maxTokens는 1 이상이어야 합니다.";
      }
    }

    // freqPenalty: -2.0 ~ 2.0 (옵션)
    if (f.freqPenalty !== null && f.freqPenalty !== undefined) {
      if (isNaN(Number(f.freqPenalty))) {
        err.freqPenalty = "freqPenalty 값이 올바르지 않습니다.";
      } else if (Number(f.freqPenalty) < -2 || Number(f.freqPenalty) > 2) {
        err.freqPenalty = "freqPenalty는 -2.0 이상 2.0 이하로 입력해주세요.";
      }
    }

    // presencePenalty: -2.0 ~ 2.0 (옵션)
    if (f.presencePenalty !== null && f.presencePenalty !== undefined) {
      if (isNaN(Number(f.presencePenalty))) {
        err.presencePenalty = "presencePenalty 값이 올바르지 않습니다.";
      } else if (
        Number(f.presencePenalty) < -2 ||
        Number(f.presencePenalty) > 2
      ) {
        err.presencePenalty =
          "presencePenalty는 -2.0 이상 2.0 이하로 입력해주세요.";
      }
    }

    // version: nullable이지만 지금은 UI에서 기본 1 지정, 1 이상 보장
    if (f.version !== null && f.version !== undefined) {
      if (Number.isNaN(Number(f.version))) {
        err.version = "버전 값이 올바르지 않습니다.";
      } else if (Number(f.version) < 1) {
        err.version = "버전은 1 이상이어야 합니다.";
      }
    }

    // status: null 허용이지만 UI에서 항상 선택하도록 강제
    if (!f.status) {
      err.status = "상태는 필수입니다.";
    }

    // JSON 필드는 서버에서 제약이 없으므로 필수는 아님.
    // 원하시면 여기서 try/catch로 JSON.parse 테스트만 추가할 수 있음.

    return err;
  };

  // 수정 모드일 때 초기값 세팅
  useEffect(() => {
    if (!value) {
      setForm(DEFAULT_FORM);
      setErrors({});
      setLinkedTouched(false);

      // 신규일 때 블록 초기화
      setWelcomeBlocks([]);
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
      welcomeBlocksJson: value.welcomeBlocksJson ?? "",
      styleJson: value.styleJson ?? "",
      toolsJson: value.toolsJson ?? "",
      policiesJson: value.policiesJson ?? "",
      version: value.version ?? 1,
      status: value.status,
      linkedSiteKeyId: value.linkedSiteKeyId ?? null,
      useTf: value.useTf ?? "Y",
      delTf: value.delTf ?? "N",
    });

    setErrors({});
    setLinkedTouched(false);
    
    setWelcomeBlocks(welcomeJsonToBlocks(value.welcomeBlocksJson));


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
    if (!value?.id) return; // 신규 모드
    if (linkedTouched) return; // 사용자가 한번이라도 건드렸으면 자동 매핑 X
    if (form.linkedSiteKeyId != null) return; // 이미 값이 있으면 재설정 X

    (async () => {
      try {
        const list = await fetchLinkedSiteKeys(value.id);
        if (!Array.isArray(list) || list.length === 0) return;

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
  }, [value?.id, linkedTouched, form.linkedSiteKeyId]);

  // Select 라벨 가독성 향상
  const siteKeyOptions = useMemo(
    () =>
      siteKeys.map((k) => ({
        value: k.id,
        label: `[${k.id}] ${k.siteKey} (${k.planCode ?? "-"}, ${k.status}${
          k.useTf === "Y" ? "" : ", off"
        })`,
        disabled: k.status !== "ACTIVE",
      })),
    [siteKeys],
  );

  const clearFieldError = (name: string) => {
    setErrors((prev) => {
      if (!prev[name as keyof ErrorMap]) return prev;
      const copy = { ...prev };
      delete copy[name as keyof ErrorMap];
      return copy;
    });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    clearFieldError(name);

    if (name === "linkedSiteKeyId") {
      setLinkedTouched(true);
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

  // uploadKey 중복 체크(이미지/카드만)
  function assertUniqueUploadKeys(blocks: WelcomeBlock[]) {
    const used = new Map<string, string>(); // key -> blockId

    for (const b of blocks) {
      if ((b.type === "image" || b.type === "card") && b.file) {
        const key = (b.uploadKey ?? "").trim().toLowerCase();
        if (!key) throw new Error(`업로드 키(uploadKey)가 비어 있습니다. (blockId=${b.id})`);

        if (used.has(key)) {
          const prev = used.get(key)!;
          throw new Error(`업로드 키가 중복되었습니다: "${key}" (blockId=${prev}, ${b.id})`);
        }
        used.set(key, b.id);
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const v = validate(form);
    if (Object.keys(v).length > 0) {
      setErrors(v);
      alert("입력값을 다시 확인해주세요.");
      return;
    }

    try {
      setSubmitting(true);

      // 1) 업로드 key 중복/누락 검사
      assertUniqueUploadKeys(welcomeBlocks);

      // 2) blocks -> welcomeBlocksJson 생성
      const welcomeBlocksJson = blocksToWelcomeJson(welcomeBlocks);

      // 3) blocks에서 파일 수집 (A안: fileName=key.ext로 리네임 포함)
      const files = collectFilesFromBlocks(welcomeBlocks);

      // 4) body에 주입해서 제출
      const nextBody = {
        ...form,
      welcomeBlocksJson,
    };

      await onSubmit(nextBody, files);
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
            {errors.name && (
              <p className="mt-1 text-[11px] text-red-500">{errors.name}</p>
            )}
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
            {errors.tenantId && (
              <p className="mt-1 text-[11px] text-red-500">
                {errors.tenantId}
              </p>
            )}
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
            {errors.purpose && (
              <p className="mt-1 text-[11px] text-red-500">
                {errors.purpose}
              </p>
            )}
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
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                >
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
                <span className="text-[11px] text-red-500">{keysError}</span>
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
              {errors.version && (
                <p className="mt-1 text-[11px] text-red-500">
                  {errors.version}
                </p>
              )}
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
            {errors.status && (
              <p className="mt-1 text-[11px] text-red-500">{errors.status}</p>
            )}
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
            {errors.model && (
              <p className="mt-1 text-[11px] text-red-500">{errors.model}</p>
            )}
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
              {errors.temperature && (
                <p className="mt-1 text-[11px] text-red-500">
                  {errors.temperature}
                </p>
              )}
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
              {errors.maxTokens && (
                <p className="mt-1 text-[11px] text-red-500">
                  {errors.maxTokens}
                </p>
              )}
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
              {errors.freqPenalty && (
                <p className="mt-1 text-[11px] text-red-500">
                  {errors.freqPenalty}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                presencePenalty
              </label>
              <input
                name="presencePenalty"
                type="number"
                step={0.1}
                min={-2}
                max={2}
                value={form.presencePenalty ?? 0}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1 text-sm"
              />
              {errors.presencePenalty && (
                <p className="mt-1 text-[11px] text-red-500">
                  {errors.presencePenalty}
                </p>
              )}
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

      <WelcomeBlocksEditor blocks={welcomeBlocks} setBlocks={setWelcomeBlocks} />        

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
