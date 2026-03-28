import React, { useEffect, useMemo, useState } from "react";
import type { PromptProfile, PromptProfileRequest, Status } from "../types/promptProfileConfig";
import type { WelcomeBlock } from "../types/welcomeBlockConfig";
import { blocksToWelcomeJson, collectFilesFromBlocks, welcomeJsonToBlocks } from "../utils/welcomeBlocksMapper";
import { WelcomeBlocksEditor } from "./WelcomeBlocksEditor";
import type { SiteKeySummary } from "../../AdminSiteKeys/types/siteKey";
import { fetchLinkedSiteKeys, fetchSiteKeyList } from "../../AdminSiteKeys/services/siteKeyApi";
import { fetchKbDocumentList } from "../../KbDocument/services/KbDocumentApi";
import type { KbDocumentResponse } from "../../KbDocument/types/KbDocumentConfig";

type Props = {
  value?: PromptProfile | null;
  onSubmit: (data: PromptProfileRequest, files?: File[]) => void | Promise<void>;
  onCancel: () => void;
};

type ErrorMap = Partial<Record<keyof PromptProfileRequest | "_global", string>>;
type ChatType = "knowledge" | "consulting";

const DEFAULT_FORM: PromptProfileRequest = {
  tenantId: "",
  name: "",
  purpose: "",
  model: "gpt-4o-mini",
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
  linkedSiteKeyId: null,
  kbDocumentIds: null,
  chatType: "knowledge",
  category: "",
  persona: "",
  memoryPolicy: "short",
  strictGroundingTf: "Y",
  requireCitationTf: "N",
  useTf: "Y",
  delTf: "N",
};

const PURPOSE_OPTIONS = ["support", "sales", "faq", "portfolio", "onboarding", "consulting"];
const CATEGORY_OPTIONS: Record<ChatType, string[]> = {
  knowledge: ["faq", "admission", "product", "policy", "manual", "support"],
  consulting: ["career", "legal", "wellness", "coaching", "saju", "finance"],
};

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {desc && <p className="mt-1 text-xs text-gray-500">{desc}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {error ? <p className="mt-1 text-[11px] text-red-500">{error}</p> : hint ? <p className="mt-1 text-[11px] text-gray-500">{hint}</p> : null}
    </div>
  );
}

export default function PromptProfileEditorForm({ value, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<PromptProfileRequest>(DEFAULT_FORM);
  const [errors, setErrors] = useState<ErrorMap>({});
  const [submitting, setSubmitting] = useState(false);
  const [welcomeBlocks, setWelcomeBlocks] = useState<WelcomeBlock[]>([]);
  const [linkedTouched, setLinkedTouched] = useState(false);
  const [siteKeys, setSiteKeys] = useState<SiteKeySummary[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [keysError, setKeysError] = useState<string | null>(null);
  const [kbDocuments, setKbDocuments] = useState<KbDocumentResponse[]>([]);
  const [loadingKbDocs, setLoadingKbDocs] = useState(false);
  const [kbDocTitleFilter, setKbDocTitleFilter] = useState("");

  const isKnowledgeChat = form.chatType !== "consulting";
  const categoryOptions = CATEGORY_OPTIONS[(form.chatType as ChatType) ?? "knowledge"] ?? CATEGORY_OPTIONS.knowledge;

  const clearFieldError = (name: string) => {
    setErrors((prev) => {
      if (!prev[name as keyof ErrorMap]) return prev;
      const next = { ...prev };
      delete next[name as keyof ErrorMap];
      return next;
    });
  };

  const patchForm = (patch: Partial<PromptProfileRequest>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const validate = (f: PromptProfileRequest): ErrorMap => {
    const err: ErrorMap = {};
    if (!f.name?.trim()) err.name = "프로필 이름은 필수입니다.";
    else if (f.name.trim().length > 100) err.name = "프로필 이름은 최대 100자입니다.";
    if (f.tenantId && f.tenantId.length > 64) err.tenantId = "Tenant ID는 최대 64자입니다.";
    if (f.purpose && f.purpose.length > 40) err.purpose = "목적은 최대 40자입니다.";
    if (!f.model?.trim()) err.model = "모델은 필수입니다.";
    else if (f.model.trim().length > 60) err.model = "모델명은 최대 60자입니다.";
    if (f.temperature === null || f.temperature === undefined || Number.isNaN(Number(f.temperature))) err.temperature = "temperature 값을 확인해 주세요.";
    else if (Number(f.temperature) < 0 || Number(f.temperature) > 1) err.temperature = "temperature는 0.0 ~ 1.0 입니다.";
    if (f.topP !== null && f.topP !== undefined && (Number.isNaN(Number(f.topP)) || Number(f.topP) < 0 || Number(f.topP) > 1)) err.topP = "topP는 0.0 ~ 1.0 입니다.";
    if (f.maxTokens !== null && f.maxTokens !== undefined && (Number.isNaN(Number(f.maxTokens)) || Number(f.maxTokens) < 1)) err.maxTokens = "maxTokens는 1 이상입니다.";
    if (f.freqPenalty !== null && f.freqPenalty !== undefined && (Number.isNaN(Number(f.freqPenalty)) || Number(f.freqPenalty) < -2 || Number(f.freqPenalty) > 2)) err.freqPenalty = "freqPenalty는 -2.0 ~ 2.0 입니다.";
    if (f.presencePenalty !== null && f.presencePenalty !== undefined && (Number.isNaN(Number(f.presencePenalty)) || Number(f.presencePenalty) < -2 || Number(f.presencePenalty) > 2)) err.presencePenalty = "presencePenalty는 -2.0 ~ 2.0 입니다.";
    if (f.version !== null && f.version !== undefined && (Number.isNaN(Number(f.version)) || Number(f.version) < 1)) err.version = "버전은 1 이상입니다.";
    if (!f.status) err.status = "상태는 필수입니다.";
    if (!f.chatType?.trim()) err.chatType = "챗봇 유형은 필수입니다.";
    if (f.category && f.category.length > 50) err.category = "카테고리는 최대 50자입니다.";
    if (f.persona && f.persona.length > 255) err.persona = "페르소나는 최대 255자입니다.";
    return err;
  };

  useEffect(() => {
    if (!value) {
      setForm(DEFAULT_FORM);
      setErrors({});
      setLinkedTouched(false);
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
      kbDocumentIds: value.kbDocumentIds ?? null,
      chatType: value.chatType ?? "knowledge",
      category: value.category ?? "",
      persona: value.persona ?? "",
      memoryPolicy: value.memoryPolicy ?? "short",
      strictGroundingTf: value.strictGroundingTf ?? "Y",
      requireCitationTf: value.requireCitationTf ?? "N",
      useTf: value.useTf ?? "Y",
      delTf: value.delTf ?? "N",
    });
    setErrors({});
    setLinkedTouched(false);
    setWelcomeBlocks(welcomeJsonToBlocks(value.welcomeBlocksJson));
  }, [value?.id]);

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
        setKeysError(e?.message ?? "SiteKey 조회에 실패했습니다.");
      } finally {
        setLoadingKeys(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoadingKbDocs(true);
        const res = await fetchKbDocumentList({
          useTf: "Y",
          page: 0,
          size: 200,
          sort: "regDate,desc",
        });
        setKbDocuments(res?.items ?? []);
      } catch (e) {
        console.warn("KB 문서 목록 로드 실패", e);
      } finally {
        setLoadingKbDocs(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!value?.id || linkedTouched || form.linkedSiteKeyId != null) return;
    (async () => {
      try {
        const list = await fetchLinkedSiteKeys(value.id);
        if (!Array.isArray(list) || list.length === 0) return;
        const best =
          list.find((k: any) => k.status === "ACTIVE" && k.delTf !== "Y" && k.useTf === "Y") ??
          list[0];
        patchForm({ linkedSiteKeyId: best.id });
      } catch (e) {
        console.warn("linked siteKeys load failed", e);
      }
    })();
  }, [value?.id, linkedTouched, form.linkedSiteKeyId]);

  const siteKeyOptions = useMemo(
    () =>
      siteKeys.map((k) => ({
        value: k.id,
        label: `[${k.id}] ${k.siteKey} (${k.planCode ?? "-"}, ${k.status}${k.useTf === "Y" ? "" : ", off"})`,
        disabled: k.status !== "ACTIVE",
      })),
    [siteKeys],
  );

  const selectedKbDocs = useMemo(() => {
    const ids = new Set(form.kbDocumentIds ?? []);
    return kbDocuments.filter((doc) => ids.has(doc.id));
  }, [kbDocuments, form.kbDocumentIds]);

  const filteredKbDocuments = useMemo(() => {
    const q = kbDocTitleFilter.trim().toLowerCase();
    if (!q) return kbDocuments;
    return kbDocuments.filter((doc) =>
      `${doc.title ?? ""} ${doc.originalFileName ?? ""}`.toLowerCase().includes(q),
    );
  }, [kbDocuments, kbDocTitleFilter]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    clearFieldError(name);
    if (name === "linkedSiteKeyId") {
      setLinkedTouched(true);
      patchForm({ linkedSiteKeyId: value === "" ? null : Number(value) });
      return;
    }
    if (["temperature", "topP", "freqPenalty", "presencePenalty"].includes(name)) {
      patchForm({ [name]: value === "" ? undefined : Number(value) } as Partial<PromptProfileRequest>);
      return;
    }
    if (["maxTokens", "seed", "version"].includes(name)) {
      patchForm({ [name]: value === "" ? undefined : Number(value) } as Partial<PromptProfileRequest>);
      return;
    }
    if (name === "status") {
      patchForm({ status: value as Status });
      return;
    }
    if (name === "useTf" || name === "delTf" || name === "strictGroundingTf" || name === "requireCitationTf") {
      patchForm({ [name]: value === "Y" ? "Y" : "N" } as Partial<PromptProfileRequest>);
      return;
    }
    if (name === "chatType") {
      const nextType = value as ChatType;
      patchForm({
        chatType: nextType,
        kbDocumentIds: nextType === "knowledge" ? form.kbDocumentIds ?? null : null,
        strictGroundingTf: nextType === "knowledge" ? form.strictGroundingTf ?? "Y" : "N",
        requireCitationTf: nextType === "knowledge" ? form.requireCitationTf ?? "N" : "N",
      });
      return;
    }
    patchForm({ [name]: value } as Partial<PromptProfileRequest>);
  };

  const toggleKbDocumentId = (docId: number) => {
    const current = form.kbDocumentIds ?? [];
    const next = current.includes(docId)
      ? current.filter((id) => id !== docId)
      : [...current, docId].sort((a, b) => a - b);
    patchForm({ kbDocumentIds: next.length ? next : null });
  };

  const assertUniqueUploadKeys = (blocks: WelcomeBlock[]) => {
    const used = new Map<string, string>();
    for (const block of blocks) {
      if ((block.type === "image" || block.type === "card") && block.file) {
        const key = (block.uploadKey ?? "").trim().toLowerCase();
        if (!key) throw new Error(`업로드 키가 비어 있습니다. (blockId=${block.id})`);
        if (used.has(key)) throw new Error(`업로드 키가 중복되었습니다. "${key}"`);
        used.set(key, block.id);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      alert("입력값을 다시 확인해 주세요.");
      return;
    }
    try {
      setSubmitting(true);
      assertUniqueUploadKeys(welcomeBlocks);
      const nextBody: PromptProfileRequest = {
        ...form,
        welcomeBlocksJson: blocksToWelcomeJson(welcomeBlocks),
        kbDocumentIds: form.chatType === "knowledge" ? form.kbDocumentIds ?? null : null,
        strictGroundingTf: form.chatType === "knowledge" ? form.strictGroundingTf ?? "Y" : "N",
        requireCitationTf: form.chatType === "knowledge" ? form.requireCitationTf ?? "N" : "N",
      };
      await onSubmit(nextBody, collectFilesFromBlocks(welcomeBlocks));
    } finally {
      setSubmitting(false);
    }
  };

  const modeLabel = value ? "프롬프트 프로필 수정" : "프롬프트 프로필 등록";
  const selectedCount = form.kbDocumentIds?.length ?? 0;

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 p-5 text-white shadow-lg">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">{modeLabel}</h2>
            <p className="mt-1 text-sm text-slate-200">챗봇 분기, KB 선택, 웰컴 블록까지 한 화면에서 설정합니다.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-200 sm:grid-cols-4">
            <div className="rounded-lg bg-white/10 px-3 py-2"><div className="text-[11px] text-slate-300">TYPE</div><div className="mt-1 font-medium">{form.chatType}</div></div>
            <div className="rounded-lg bg-white/10 px-3 py-2"><div className="text-[11px] text-slate-300">STATUS</div><div className="mt-1 font-medium">{form.status}</div></div>
            <div className="rounded-lg bg-white/10 px-3 py-2"><div className="text-[11px] text-slate-300">VERSION</div><div className="mt-1 font-medium">{form.version ?? 1}</div></div>
            <div className="rounded-lg bg-white/10 px-3 py-2"><div className="text-[11px] text-slate-300">KB DOCS</div><div className="mt-1 font-medium">{selectedCount}</div></div>
          </div>
        </div>
      </div>

      <Section title="기본 정보" desc="프로필 식별 정보와 배포 상태를 정의합니다.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="프로필 이름" required error={errors.name}>
            <input name="name" value={form.name} onChange={handleChange} className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm" placeholder="예: HSBS 입학 안내 기본 프로필" />
          </Field>
          <Field label="Tenant ID" error={errors.tenantId} hint="비워두면 글로벌 설정처럼 동작합니다.">
            <input name="tenantId" value={form.tenantId ?? ""} onChange={handleChange} className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm" placeholder="tenant-school-a" />
          </Field>
          <Field label="목적" error={errors.purpose} hint="운영 목적을 짧게 남겨두면 관리가 쉬워집니다.">
            <div className="space-y-2">
              <input name="purpose" value={form.purpose ?? ""} onChange={handleChange} list="prompt-purpose-options" className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm" placeholder="support / sales / faq / consulting" />
              <datalist id="prompt-purpose-options">{PURPOSE_OPTIONS.map((item) => <option key={item} value={item} />)}</datalist>
            </div>
          </Field>
          <Field label="연결 SiteKey" hint="선택하면 해당 사이트의 기본 프롬프트로 연결됩니다.">
            <select name="linkedSiteKeyId" value={form.linkedSiteKeyId ?? ""} onChange={handleChange} className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm">
              <option value="">선택 안 함</option>
              {siteKeyOptions.map((opt) => <option key={opt.value} value={opt.value} disabled={opt.disabled}>{opt.label}</option>)}
            </select>
            <div className="mt-1 min-h-[16px] text-[11px]">{loadingKeys ? <span className="text-gray-400">SiteKey 목록을 불러오는 중입니다.</span> : null}{keysError ? <span className="text-red-500">{keysError}</span> : null}</div>
          </Field>
          <Field label="사용 여부">
            <select name="useTf" value={form.useTf ?? "Y"} onChange={handleChange} className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm"><option value="Y">사용</option><option value="N">미사용</option></select>
          </Field>
          <Field label="상태" error={errors.status}>
            <select name="status" value={form.status} onChange={handleChange} className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm"><option value="DRAFT">DRAFT</option><option value="ACTIVE">ACTIVE</option><option value="ARCHIVED">ARCHIVED</option></select>
          </Field>
          <Field label="버전" error={errors.version}>
            <input name="version" type="number" min={1} value={form.version ?? 1} onChange={handleChange} className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm" />
          </Field>
          <Field label="카테고리" error={errors.category} hint={`추천: ${categoryOptions.join(", ")}`}>
            <input name="category" value={form.category ?? ""} onChange={handleChange} list="prompt-category-options" className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm" placeholder="faq / career / legal / product" />
            <datalist id="prompt-category-options">{categoryOptions.map((item) => <option key={item} value={item} />)}</datalist>
          </Field>
        </div>
      </Section>

      <Section title="챗봇 유형" desc="지식형과 상담형을 나눠 필요한 옵션만 노출되도록 구성했습니다.">
        <div className="grid gap-3 md:grid-cols-2">
          {(["knowledge", "consulting"] as ChatType[]).map((type) => {
            const selected = form.chatType === type;
            const label = type === "knowledge" ? "지식형 챗봇" : "상담형 챗봇";
            const desc = type === "knowledge"
              ? "KB 문서를 근거로 응답하고 grounding, citation 옵션을 함께 운영합니다."
              : "페르소나와 대화 흐름 중심으로 운영하고 상담 UX에 집중합니다.";
            const tone = type === "knowledge" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-emerald-200 bg-emerald-50 text-emerald-700";
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  clearFieldError("chatType");
                  patchForm({
                    chatType: type,
                    kbDocumentIds: type === "knowledge" ? form.kbDocumentIds ?? null : null,
                    strictGroundingTf: type === "knowledge" ? form.strictGroundingTf ?? "Y" : "N",
                    requireCitationTf: type === "knowledge" ? form.requireCitationTf ?? "N" : "N",
                  });
                }}
                className={`rounded-xl border px-4 py-4 text-left transition ${selected ? `${tone} ring-2 ring-slate-300 ring-offset-1` : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-gray-100"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{label}</div>
                  <div className="text-xs uppercase">{type}</div>
                </div>
                <p className="mt-2 text-xs leading-5">{desc}</p>
              </button>
            );
          })}
        </div>
        {errors.chatType ? <p className="text-[11px] text-red-500">{errors.chatType}</p> : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="페르소나" error={errors.persona} hint="상담형에서는 응대 캐릭터를, 지식형에서는 말투/전문성 힌트를 적어두면 좋습니다.">
            <textarea name="persona" value={form.persona ?? ""} onChange={handleChange} rows={4} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="예: 차분하고 신뢰감 있게 핵심만 답하는 입학 상담 매니저" />
          </Field>
          <div className="grid gap-4">
            <Field label="메모리 정책">
              <select name="memoryPolicy" value={form.memoryPolicy ?? "short"} onChange={handleChange} className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm">
                <option value="short">short</option>
                <option value="summary_history">summary_history</option>
              </select>
            </Field>
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-3 text-xs leading-5 text-gray-600">
              {isKnowledgeChat
                ? "지식형 챗봇으로 저장됩니다. 선택한 KB 문서를 기반으로 웰컴 블록 자동 생성과 grounding 옵션을 함께 운영할 수 있습니다."
                : "상담형 챗봇으로 저장됩니다. KB 문서 선택은 숨기고, 페르소나와 대화 흐름 중심 설정에 집중합니다."}
            </div>
          </div>
        </div>
      </Section>

      <Section title="모델 파라미터" desc="OpenAI 호출 파라미터와 JSON 기반 옵션을 조정합니다.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="모델" required error={errors.model}><input name="model" value={form.model} onChange={handleChange} className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm" placeholder="gpt-4o-mini" /></Field>
          <Field label="temperature" error={errors.temperature}><input name="temperature" type="number" step="0.1" min={0} max={1} value={form.temperature ?? 0.7} onChange={handleChange} className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm" /></Field>
          <Field label="topP" error={errors.topP}><input name="topP" type="number" step="0.1" min={0} max={1} value={form.topP ?? ""} onChange={handleChange} className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm" /></Field>
          <Field label="maxTokens" error={errors.maxTokens}><input name="maxTokens" type="number" min={1} value={form.maxTokens ?? ""} onChange={handleChange} className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm" /></Field>
          <Field label="seed"><input name="seed" type="number" value={form.seed ?? ""} onChange={handleChange} className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm" /></Field>
          <Field label="freqPenalty" error={errors.freqPenalty}><input name="freqPenalty" type="number" step="0.1" min={-2} max={2} value={form.freqPenalty ?? 0} onChange={handleChange} className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm" /></Field>
          <Field label="presencePenalty" error={errors.presencePenalty}><input name="presencePenalty" type="number" step="0.1" min={-2} max={2} value={form.presencePenalty ?? 0} onChange={handleChange} className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm" /></Field>
          <Field label="stopJson" hint='예: ["\\nUser:", "\\nSystem:"]'><input name="stopJson" value={form.stopJson ?? ""} onChange={handleChange} className="h-10 w-full rounded-lg border border-gray-300 px-3 font-mono text-xs" placeholder='["\\nUser:"]' /></Field>
        </div>
      </Section>

      <Section title="프롬프트 템플릿" desc="시스템 프롬프트와 가드레일을 분리해 운영할 수 있습니다.">
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="systemTpl"><textarea name="systemTpl" value={form.systemTpl ?? ""} onChange={handleChange} className="min-h-[180px] w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs" placeholder="예: 당신은 HSBS 사이트의 AI 안내 도우미입니다..." /></Field>
          <Field label="guardrailTpl"><textarea name="guardrailTpl" value={form.guardrailTpl ?? ""} onChange={handleChange} className="min-h-[180px] w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs" placeholder="예: 모르는 내용은 추정하지 말고, 근거가 없으면 명확히 한계를 안내합니다." /></Field>
        </div>
      </Section>

      <Section
        title={isKnowledgeChat ? "지식형 설정" : "상담형 설정"}
        desc={isKnowledgeChat ? "선택된 KB 문서를 근거로 사용할지, 출처 표기를 강제할지 결정합니다." : "상담형은 KB 선택 대신 대화 스타일과 응대 흐름에 집중합니다."}
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <Field label="strictGroundingTf" hint="Y이면 문서 근거 중심으로 보수적으로 답합니다.">
            <select name="strictGroundingTf" value={isKnowledgeChat ? form.strictGroundingTf ?? "Y" : "N"} onChange={handleChange} disabled={!isKnowledgeChat} className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm disabled:bg-gray-100 disabled:text-gray-400"><option value="Y">Y</option><option value="N">N</option></select>
          </Field>
          <Field label="requireCitationTf" hint="Y이면 출처 노출 응답 정책을 사용합니다.">
            <select name="requireCitationTf" value={isKnowledgeChat ? form.requireCitationTf ?? "N" : "N"} onChange={handleChange} disabled={!isKnowledgeChat} className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm disabled:bg-gray-100 disabled:text-gray-400"><option value="N">N</option><option value="Y">Y</option></select>
          </Field>
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-xs leading-5 text-gray-600">
            {isKnowledgeChat
              ? "KB 문서를 선택하지 않으면 일반 프롬프트 기반 응답만 수행합니다. 웰컴 블록 자동 생성은 선택 문서의 welcome 메타를 사용합니다."
              : "상담형에서는 KB 선택 영역을 숨기지만 welcome 블록과 style/tools/policies JSON은 그대로 사용할 수 있습니다."}
          </div>
        </div>

        {isKnowledgeChat ? (
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">KB 문서 선택</div>
                <p className="mt-1 text-xs text-gray-600">선택한 문서의 요약과 웰컴 메타가 지식형 챗봇 응답과 웰컴 UI 생성에 사용됩니다.</p>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-blue-700">선택 {selectedCount}건</div>
            </div>

            {loadingKbDocs ? <span className="text-[11px] text-gray-400">KB 문서 목록을 불러오는 중입니다.</span> : kbDocuments.length === 0 ? <span className="text-[11px] text-gray-400">등록된 KB 문서가 없습니다.</span> : (
              <>
                <div className="mb-3">
                  <input type="text" value={kbDocTitleFilter} onChange={(e) => setKbDocTitleFilter(e.target.value)} placeholder="문서 제목 또는 파일명으로 검색" className="h-10 w-full max-w-md rounded-lg border border-gray-300 px-3 text-sm" aria-label="KB 문서 검색" />
                </div>
                <div className="max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white">
                  <table className="w-full border-collapse text-sm">
                    <thead className="sticky top-0 z-[1] bg-gray-50">
                      <tr className="border-b border-gray-200 text-gray-600">
                        <th className="w-12 px-3 py-2 text-left font-medium">선택</th>
                        <th className="w-16 px-3 py-2 text-left font-medium">ID</th>
                        <th className="px-3 py-2 text-left font-medium">문서</th>
                        <th className="px-3 py-2 text-left font-medium">미리보기</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredKbDocuments.map((doc) => {
                        const checked = (form.kbDocumentIds ?? []).includes(doc.id);
                        const previewText = (doc.indexSummary && doc.indexSummary.trim()) || (doc.tagsJson && (() => {
                          try {
                            const tags = JSON.parse(doc.tagsJson) as string[];
                            return Array.isArray(tags) && tags.length ? `태그: ${tags.join(", ")}` : null;
                          } catch {
                            return null;
                          }
                        })()) || null;
                        return (
                          <tr key={doc.id} className={`border-b border-gray-100 align-top last:border-0 ${checked ? "bg-blue-50/70" : "hover:bg-gray-50"}`}>
                            <td className="px-3 py-2"><input type="checkbox" checked={checked} onChange={() => toggleKbDocumentId(doc.id)} className="cursor-pointer rounded" aria-label={`문서 ${doc.id} 선택`} /></td>
                            <td className="px-3 py-2 tabular-nums text-gray-500">{doc.id}</td>
                            <td className="px-3 py-2"><div className="font-medium text-gray-800">{doc.title ?? doc.originalFileName ?? "(제목 없음)"}</div><div className="mt-1 text-[11px] text-gray-500">{[doc.category, doc.docType].filter(Boolean).join(" · ")}</div></td>
                            <td className="px-3 py-2 text-xs leading-5 text-gray-600">{previewText ? (previewText.length > 140 ? `${previewText.slice(0, 140)}...` : previewText) : <span className="italic text-gray-400">요약 또는 태그 없음</span>}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        ) : null}
      </Section>

      <WelcomeBlocksEditor blocks={welcomeBlocks} setBlocks={setWelcomeBlocks} selectedKbDocs={selectedKbDocs} />

      <Section title="JSON 설정" desc="렌더링 스타일, 툴 정의, 정책 JSON을 분리 관리합니다.">
        <div className="grid gap-4 lg:grid-cols-3">
          <Field label="styleJson" hint='예: {"lang":"ko","tone":"casual","length":"short"}'><textarea name="styleJson" value={form.styleJson ?? ""} onChange={handleChange} className="min-h-[120px] w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs" placeholder='{"lang":"ko","tone":"casual","length":"short"}' /></Field>
          <Field label="toolsJson" hint="허용 툴과 함수 스키마를 JSON 배열로 입력합니다."><textarea name="toolsJson" value={form.toolsJson ?? ""} onChange={handleChange} className="min-h-[120px] w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs" placeholder='[{"type":"function","function":{"name":"searchDocs"}}]' /></Field>
          <Field label="policiesJson" hint="금칙어, PII, 산업별 운영 정책을 JSON으로 관리합니다."><textarea name="policiesJson" value={form.policiesJson ?? ""} onChange={handleChange} className="min-h-[120px] w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs" placeholder='{"piiMasking":"Y","restrictedTopics":["medical","legal"]}' /></Field>
        </div>
      </Section>

      <div className="flex justify-end gap-2 border-t border-gray-200 pt-3">
        <button type="button" onClick={onCancel} disabled={submitting} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">취소</button>
        <button type="submit" disabled={submitting} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-60">{submitting ? "저장 중..." : "저장"}</button>
      </div>
    </form>
  );
}
