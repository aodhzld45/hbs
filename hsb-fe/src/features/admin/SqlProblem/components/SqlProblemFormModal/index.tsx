// src/features/SqlProblem/components/SqlProblemFormModal/index.tsx
import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import BasicInfoSection from "./BasicInfoSection";
import StatementSection from "./StatementSection";
import DataAndTestSection from "./DataAndTestSection";
import PreviewControls from "./PreviewControls";
import { usePreview } from "../../hooks/usePreview";

import {
  ProblemPayload,
  SqlTestcasePayload,
  ExpectedMode,
  TestcaseVisibility,
} from "../../types/ProblemPayload";

/* ----------------------------------------------------------------
 * helpers
 * ---------------------------------------------------------------- */
const oneOf = <T extends string>(...values: readonly T[]) =>
  z
    .string()
    .refine((v): v is T => (values as readonly string[]).includes(v), {
      message: `Must be one of: ${values.join(", ")}`,
    }) as unknown as z.ZodType<T>;

const expectedMode = oneOf(
  "SQL_EQUAL",
  "SQL_AST_PATTERN",
  "RESULT_SET",
  "AFFECTED_ROWS",
  "STATE_SNAPSHOT",
  "CUSTOM_ASSERT"
);

const testcaseBase = z.object({
  name: z.string().min(1, "테스트케이스명 필수"),
  visibility: oneOf("PUBLIC", "HIDDEN"),

  // 모드에 따라 필수/선택
  expectedSql: z.string().optional(),

  seedOverride: z.string().optional(),
  noteMd: z.string().optional(),

  // 숫자 필드는 coerce로 400 방지 (빈문자 → 숫자 변환)
  sortNo: z.coerce.number().optional(),

  expectedMode: expectedMode,
  expectedMetaJson: z.string().optional(),
  assertSql: z.string().optional(),
  expectedRows: z.coerce.number().optional(), // AFFECTED_ROWS에서 사용
  orderSensitiveOverride: z.boolean().optional(),
});

/* ----------------------------------------------------------------
 * Schema (DB 스키마 기준)
 * ---------------------------------------------------------------- */
const schema = z
  .object({
    // sql_problem
    title: z.string().min(1, "제목은 필수입니다."),
    level: z.coerce.number().optional(),
    tags: z.array(z.string()).optional(),
    useTf: oneOf("Y", "N"),
    constraintRule: oneOf("SELECT_ONLY", "DML_ALLOWED"),
    descriptionMd: z.string().optional(),
    orderSensitive: z.boolean().optional(),

    // sql_schema
    schema: z.object({
      ddlScript: z.string().min(1, "DDL은 필수입니다."),
      seedScript: z.string().min(1, "Seed는 필수입니다."),
    }),

    // sql_testcase[]
    testcases: z
      .array(testcaseBase)
      .min(1, "테스트케이스를 1개 이상 추가해 주세요."),
  })
  .superRefine((values, ctx) => {
    values.testcases.forEach((tc, i) => {
      const path = (k: string) => ({ path: ["testcases", i, k] as any });
      switch (tc.expectedMode) {
        case "SQL_EQUAL":
          if (!tc.expectedSql?.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "expectedSql 필수",
              ...path("expectedSql"),
            });
          }
          break;
        case "SQL_AST_PATTERN":
          if (!tc.expectedMetaJson?.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "expectedMetaJson 필수(필수/금지 패턴 JSON)",
              ...path("expectedMetaJson"),
            });
          }
          break;
        case "RESULT_SET":
          if (!tc.expectedSql?.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "expectedSql 필수",
              ...path("expectedSql"),
            });
          }
          break;
        case "AFFECTED_ROWS":
          if (
            tc.expectedRows === undefined ||
            tc.expectedRows === null ||
            Number.isNaN(tc.expectedRows)
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "expectedRows 필수",
              ...path("expectedRows"),
            });
          }
          break;
        case "STATE_SNAPSHOT":
        case "CUSTOM_ASSERT":
          if (!tc.assertSql?.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "assertSql 필수(검증용 SELECT)",
              ...path("assertSql"),
            });
          }
          break;
      }
    });
  });

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: ProblemPayload) => Promise<void> | void;
  /** 수정 모드일 때 상위에서 내려주는 상세 값 (비동기여도 OK) */
  initial?: Partial<ProblemPayload> | null;
};

/* ----------------------------------------------------------------
 * normalize (제출 전 가공)
 * ---------------------------------------------------------------- */
const normalizeForSubmit = (v: FormValues): ProblemPayload => {
  const trim = (s?: string) => (typeof s === "string" ? s.trim() : s);
  return {
    title: trim(v.title) || "",
    level: v.level,
    tags: (v.tags ?? []).map((t) => t.trim()).filter(Boolean),
    descriptionMd: trim(v.descriptionMd),
    constraintRule: v.constraintRule,
    orderSensitive: !!v.orderSensitive,
    useTf: v.useTf,
    schema: {
      ddlScript: v.schema.ddlScript.trim(),
      seedScript: v.schema.seedScript.trim(),
    },
    testcases: (v.testcases ?? []).map((t, i) => ({
      name: t.name.trim(),
      visibility: t.visibility,
      expectedSql: t.expectedSql
        ? t.expectedSql.replace(/;+$/g, "").trim()
        : undefined,
      seedOverride: trim(t.seedOverride),
      noteMd: trim(t.noteMd),
      sortNo: Number.isFinite(Number(t.sortNo)) ? Number(t.sortNo) : i,

      expectedMode: (t.expectedMode ?? "RESULT_SET") as any,
      expectedMetaJson: trim(t.expectedMetaJson) || undefined,
      assertSql: t.assertSql
        ? t.assertSql.replace(/;+$/g, "").trim()
        : undefined,
      expectedRows:
        t.expectedRows === undefined || t.expectedRows === null
          ? undefined
          : Number(t.expectedRows),
      orderSensitiveOverride: t.orderSensitiveOverride ?? undefined,
    })),
  };
};

/* ----------------------------------------------------------------
 * defaults & initial mapping
 * ---------------------------------------------------------------- */
const DEFAULT_TESTCASE: SqlTestcasePayload = {
  name: "",
  visibility: "PUBLIC",
  expectedSql: "",
  sortNo: 0,
  expectedMode: "RESULT_SET",
};

const makeDefaults = (): FormValues => ({
  title: "",
  level: undefined,
  tags: [],
  useTf: "Y",
  constraintRule: "SELECT_ONLY",
  descriptionMd: "",
  orderSensitive: false,
  schema: { ddlScript: "", seedScript: "" },
  testcases: [
    {
      name: "",
      visibility: "PUBLIC",
      expectedSql: "",
      noteMd: "",
      sortNo: 0,
      expectedMode: "RESULT_SET",
      expectedMetaJson: "",
      assertSql: "",
      expectedRows: undefined,
      orderSensitiveOverride: false,
    },
  ],
});

/** API(initial) → RHF 폼값으로 얕은 매핑 (fallback 타입 고정) */
const toFormInitial = (
  src?: Partial<ProblemPayload> | null
): Partial<FormValues> => {
  const tcs: SqlTestcasePayload[] =
    Array.isArray(src?.testcases) && src!.testcases!.length > 0
      ? (src!.testcases as SqlTestcasePayload[])
      : [DEFAULT_TESTCASE satisfies SqlTestcasePayload];

  return {
    title: src?.title ?? "",
    level: src?.level ?? undefined,
    tags: Array.isArray(src?.tags) ? src!.tags! : [],
    useTf: (src?.useTf as "Y" | "N") ?? "Y",
    constraintRule:
      (src?.constraintRule as FormValues["constraintRule"]) ??
      "SELECT_ONLY",
    descriptionMd: src?.descriptionMd ?? "",
    orderSensitive: !!src?.orderSensitive,
    schema: {
      ddlScript: src?.schema?.ddlScript ?? "",
      seedScript: src?.schema?.seedScript ?? "",
    },
    testcases: tcs.map((t, i) => ({
      name: t.name ?? "",
      visibility: (t.visibility as TestcaseVisibility) ?? "PUBLIC",
      expectedSql: t.expectedSql ?? "",
      seedOverride: t.seedOverride ?? "",
      noteMd: t.noteMd ?? "",
      sortNo: typeof t.sortNo === "number" ? t.sortNo : i,
      expectedMode: (t.expectedMode ?? "RESULT_SET") as ExpectedMode,
      expectedMetaJson: t.expectedMetaJson ?? "",
      assertSql: t.assertSql ?? "",
      expectedRows:
        typeof t.expectedRows === "number" ? t.expectedRows : undefined,
      orderSensitiveOverride:
        typeof t.orderSensitiveOverride === "boolean"
          ? t.orderSensitiveOverride
          : false,
    })),
  };
};

/* ----------------------------------------------------------------
 * Component
 * ---------------------------------------------------------------- */
const SqlProblemFormModal: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  initial,
}) => {
  const [saving, setSaving] = useState(false);
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    defaultValues: makeDefaults(), // 초기 mount 때만 사용. 실제 reset은 useEffect에서.
    mode: "onChange",
  });

  // 미리보기 훅: 푸터 버튼과 연결
  const {
    previewLoading,
    schemaStatus,
    runStatus,
    validateStatus,
    handlePreviewSchema,
    handlePreviewRun,
    handlePreviewValidate,
    canSchema,
    canRun,
    canValidate,
  } = usePreview(methods);

  // 모달 열릴 때/initial 변할 때 완전 reset (수정 모드 바인딩)
  useEffect(() => {
    if (!open) return;
    const next = { ...makeDefaults(), ...toFormInitial(initial) };
    methods.reset(next); // ★ 완전 교체 reset
  }, [open, initial, methods]);

  const submit = methods.handleSubmit(
    async (values) => {
      try {
        setSaving(true);
        const payload = normalizeForSubmit(values);
        await onSubmit(payload);
        onClose(); // 성공시에만 닫기
      } catch (e) {
        // 실패 시 모달 유지
        console.error(e);
      } finally {
        setSaving(false);
      }
    },
    (errors) => {
      const first = Object.values(errors)[0] as any;
      alert(first?.message ?? "입력값을 확인해주세요.");
    }
  );

  if (!open) return null;

  const disableAll =
    saving || previewLoading !== null; // 저장/프리뷰 중에는 비활성

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 overflow-y-auto">
      <div className="min-h-full w-full flex items-start md:items-center justify-center p-3 md:p-6">
        <div className="bg-white w-full md:max-w-5xl h-[100dvh] md:h-auto md:max-h-[85dvh] rounded-none md:rounded-2xl shadow-xl flex flex-col">
          {/* 헤더 */}
          <div className="px-4 md:px-6 py-3 border-b flex items-center justify-between shrink-0">
            <h3 className="text-lg font-semibold">
              {initial ? "문제 수정" : "문제 등록"}
            </h3>
            <button className="button-ghost" onClick={onClose} disabled={disableAll}>
              닫기
            </button>
          </div>

          {/* 내용 */}
          <FormProvider {...methods}>
            <div className="px-4 md:px-6 py-4 overflow-y-auto grow">
              <div className="grid grid-cols-1 gap-4">
                <BasicInfoSection />
                <StatementSection />
                <DataAndTestSection />
              </div>
            </div>

            {/* 푸터 */}
            <div className="px-4 md:px-6 py-3 border-t flex justify-end gap-2 shrink-0 bg-white">
              <button className="button-secondary" onClick={onClose} disabled={disableAll}>
                취소
              </button>

              {/* 미리보기 컨트롤 모음 */}
              <PreviewControls
                previewLoading={previewLoading}
                schemaStatus={schemaStatus}
                runStatus={runStatus}
                validateStatus={validateStatus}
                onSchema={handlePreviewSchema}
                onRun={handlePreviewRun}
                onValidate={handlePreviewValidate}
                disableSchema={disableAll || !canSchema}
                disableRun={disableAll || !canRun}
                disableValidate={disableAll || !canValidate}
              />

              <button className="button-primary" onClick={submit} disabled={disableAll}>
                저장
              </button>
            </div>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default SqlProblemFormModal;
