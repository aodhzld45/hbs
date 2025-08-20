// src/features/SqlProblem/hooks/usePreview.ts
import { useState, useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";
import { previewSchema, previewRun, previewValidate } from "../services/previewApi";

export type PreviewKind = "schema" | "run" | "validate" | null;
export type Status = "idle" | "ok" | "error";

export function usePreview(methods: UseFormReturn<any>) {
  const [previewLoading, setPreviewLoading] = useState<PreviewKind>(null);
  const [schemaStatus, setSchemaStatus] = useState<Status>("idle");
  const [runStatus, setRunStatus] = useState<Status>("idle");
  const [validateStatus, setValidateStatus] = useState<Status>("idle");

  // ---- getters ----
  const getSchema = () => {
    const { ddlScript, seedScript } = methods.getValues("schema") || {};
    return {
      ddl: (ddlScript || "").trim(),
      seed: (seedScript || "").trim(),
    };
  };
  const getFirstExpectedSql = () =>
    (methods.getValues("testcases")?.[0]?.expectedSql || "").trim();

  // ---- pre-check helpers (빈값이면 호출 막고 에러 표기) ----
  const ensureSchemaFilled = (): { ddl: string; seed: string } | null => {
    const { ddl, seed } = getSchema();
    if (!ddl) {
      setSchemaStatus("error");
      alert("DDL이 비어 있습니다.");
      return null;
    }
    if (!seed) {
      setSchemaStatus("error");
      alert("Seed가 비어 있습니다.");
      return null;
    }
    return { ddl, seed };
  };

  const ensureRunFilled = (): { ddl: string; seed: string; sql: string } | null => {
    const base = ensureSchemaFilled();
    if (!base) return null;
    const sql = getFirstExpectedSql();
    if (!sql) {
      setRunStatus("error");
      alert("실행할 SQL(첫 테스트케이스 expectedSql)이 비어 있습니다.");
      return null;
    }
    return { ddl: base.ddl, seed: base.seed, sql };
  };

  const ensureValidateFilled = (): {
    ddl: string;
    seed: string;
    tcs: Array<{ answerSql?: string; expectedSql?: string; expectedMode?: string; expectedMetaJson?: string; assertSql?: string; expectedRows?: number }>;
  } | null => {
    const base = ensureSchemaFilled();
    if (!base) return null;

    const tcs = (methods.getValues("testcases") || []) as any[];

    if (!tcs.length) {
      setValidateStatus("error");
      alert("테스트케이스가 없습니다.");
      return null;
    }

    // 모드별 필수값 간단 검증 (폼 제출 zod와 동일한 핵심만)
    for (let i = 0; i < tcs.length; i++) {
      const tc = tcs[i];
      const mode = (tc.expectedMode || "RESULT_SET") as string;

      if ((mode === "RESULT_SET" || mode === "SQL_EQUAL") && !String(tc.expectedSql || "").trim()) {
        setValidateStatus("error");
        alert(`TC#${i + 1}: expectedSql이 필요합니다.`);
        return null;
      }
      if (mode === "SQL_AST_PATTERN" && !String(tc.expectedMetaJson || "").trim()) {
        setValidateStatus("error");
        alert(`TC#${i + 1}: expectedMetaJson(JSON)이 필요합니다.`);
        return null;
      }
      if (mode === "AFFECTED_ROWS" && (tc.expectedRows === undefined || tc.expectedRows === null || Number.isNaN(Number(tc.expectedRows)))) {
        setValidateStatus("error");
        alert(`TC#${i + 1}: expectedRows가 필요합니다.`);
        return null;
      }
      if ((mode === "STATE_SNAPSHOT" || mode === "CUSTOM_ASSERT") && !String(tc.assertSql || "").trim()) {
        setValidateStatus("error");
        alert(`TC#${i + 1}: assertSql이 필요합니다.`);
        return null;
      }
    }

    // previewValidate는 현재 answerSql/expectedSql만 받도록 되어 있다면 최소 필드만 전달
    const slim = tcs.map((tc) => ({
      answerSql: String(tc.expectedSql || "").trim(),   // 임시로 expectedSql을 양쪽에
      expectedSql: String(tc.expectedSql || "").trim(),
      expectedMode: tc.expectedMode,
      expectedMetaJson: tc.expectedMetaJson,
      assertSql: tc.assertSql,
      expectedRows: tc.expectedRows,
    }));

    return { ddl: base.ddl, seed: base.seed, tcs: slim };
  };

  // ---- handlers ----
  const handlePreviewSchema = useCallback(async () => {
    const base = ensureSchemaFilled();
    if (!base) return;

    setPreviewLoading("schema");
    try {
      const res = await previewSchema({ ddlScript: base.ddl, seedScript: base.seed });
      setSchemaStatus(res.ok ? "ok" : "error");
      if (!res.ok) alert(res.message || "Schema 실패");
    } catch (e: any) {
      setSchemaStatus("error");
      alert(e?.response?.data?.message || e.message || "Schema 호출 실패");
    } finally {
      setPreviewLoading(null);
    }
  }, [methods]);

  const handlePreviewRun = useCallback(async () => {
    const base = ensureRunFilled();
    if (!base) return;

    setPreviewLoading("run");
    try {
      // 스키마 초기화 먼저
      const sch = await previewSchema({ ddlScript: base.ddl, seedScript: base.seed });
      if (!sch.ok) {
        setRunStatus("error");
        alert(sch.message || "Schema 초기화 실패");
        setPreviewLoading(null);
        return;
      }

      const res = await previewRun({
        ddlScript: base.ddl,
        seedScript: base.seed,
        answerSql: base.sql.replace(/;+$/g, "").trim(),
      });
      setRunStatus(res.ok ? "ok" : "error");
      if (!res.ok) alert(res.message || "Run 실패");
    } catch (e: any) {
      setRunStatus("error");
      alert(e?.response?.data?.message || e.message || "Run 호출 실패");
    } finally {
      setPreviewLoading(null);
    }
  }, [methods]);

  const handlePreviewValidate = useCallback(async () => {
    const base = ensureValidateFilled();
    if (!base) return;

    setPreviewLoading("validate");
    try {
      const res = await previewValidate({
        ddlScript: base.ddl,
        seedScript: base.seed,
        testcases: base.tcs,
      });
      setValidateStatus(res.ok ? "ok" : "error");
      if (!res.ok) alert(res.message || "Validate 실패");
    } catch (e: any) {
      setValidateStatus("error");
      alert(e?.response?.data?.message || e.message || "Validate 호출 실패");
    } finally {
      setPreviewLoading(null);
    }
  }, [methods]);

  // 버튼 비활성화 플래그
  const canSchema = (() => {
    const { ddl, seed } = getSchema();
    return !!ddl && !!seed;
  })();
  const canRun = (() => canSchema && !!getFirstExpectedSql())();
  const canValidate = (() => {
    const { ddl, seed } = getSchema();
    const tcs = methods.getValues("testcases") || [];
    return !!ddl && !!seed && tcs.length > 0;
  })();

  return {
    previewLoading,
    schemaStatus,
    runStatus,
    validateStatus,
    handlePreviewSchema,
    handlePreviewRun,
    handlePreviewValidate,
    // 버튼 비활성 플래그
    canSchema,
    canRun,
    canValidate,
  };
}
