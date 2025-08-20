// src/features/SqlProblem/components/SqlProblemFormModal/PreviewControls.tsx
import React from "react";
import type { Status, PreviewKind } from "../../hooks/usePreview";

export function renderBadge(status: Status) {
  if (status === "ok")
    return <span className="ml-2 inline-flex items-center px-1.5 py-0.5 text-[10px] rounded bg-green-100 text-green-700">OK</span>;
  if (status === "error")
    return <span className="ml-2 inline-flex items-center px-1.5 py-0.5 text-[10px] rounded bg-red-100 text-red-700">ERR</span>;
  return null;
}

type Props = {
  previewLoading: PreviewKind;
  schemaStatus: Status;
  runStatus: Status;
  validateStatus: Status;
  onSchema: () => void;
  onRun: () => void;
  onValidate: () => void;
  disableSchema?: boolean; // 선택적, 버튼 비활성화 여부
  disableRun?: boolean; // 선택적, 버튼 비활성화 여부 
  disableValidate?: boolean; // 선택적, 버튼 비활성화 여부
};

const PreviewControls: React.FC<Props> = ({
  previewLoading,
  schemaStatus,
  runStatus,
  validateStatus,
  onSchema,
  onRun,
  onValidate,
  disableSchema,
  disableRun,
  disableValidate,
}) => {
  const isBusy = previewLoading !== null;

  const schemaDisabled = !!disableSchema || isBusy;
  const runDisabled = !!disableRun || isBusy;
  const validateDisabled = !!disableValidate || isBusy;

  return (
    <>
      {/* [PREVIEW] 스키마 */}
      <button
        type="button"
        className="px-3 py-2 rounded bg-amber-600 text-white disabled:opacity-60"
        onClick={onSchema}
        disabled={schemaDisabled}
        title="DDL/SEED 적용만 점검"
      >
        {previewLoading === "schema" ? "검증 중..." : "Schema"}
        {renderBadge(schemaStatus)}
      </button>

      {/* [PREVIEW] 런 */}
      <button
        type="button"
        className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
        onClick={onRun}
        disabled={runDisabled}
        title="Answer SQL 단발 실행"
      >
        {previewLoading === "run" ? "실행 중..." : "Run"}
        {renderBadge(runStatus)}
      </button>

      {/* [PREVIEW] 밸리데이트 */}
      <button
        type="button"
        className="px-3 py-2 rounded bg-green-600 text-white disabled:opacity-60"
        onClick={onValidate}
        disabled={validateDisabled}
        title="테스트케이스 검증"
      >
        {previewLoading === "validate" ? "검증 중..." : "Validate"}
        {renderBadge(validateStatus)}
      </button>
    </>
  );
};

export default PreviewControls;
