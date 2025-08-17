import React from "react";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import MonacoSql from "./MonacoSql";

const VIS = ["PUBLIC", "HIDDEN"] as const;
const MODES = [
  { value: "RESULT_SET", label: "결과셋 비교(기본)" },
  { value: "SQL_EQUAL", label: "SQL 동일(정규화)" },
  { value: "SQL_AST_PATTERN", label: "AST 패턴 검사" },
  { value: "AFFECTED_ROWS", label: "영향 행 수(DML)" },
  { value: "STATE_SNAPSHOT", label: "상태 스냅샷" },
  { value: "CUSTOM_ASSERT", label: "커스텀 Assertion" },
] as const;

const DataAndTestSection: React.FC = () => {
  const { control } = useFormContext();

  return (
    <section className="p-4 rounded-xl border bg-white">
      <h4 className="font-semibold mb-3">데이터 & 테스트 케이스</h4>

      {/* ② 스키마 */}
      <div className="space-y-3 mb-6">
        <div>
          <div className="text-sm font-medium mb-1">DDL *</div>
          <Controller
            name="schema.ddlScript"
            control={control}
            render={() => <MonacoSql name="schema.ddlScript" height={220} />}
          />
        </div>
        <div>
          <div className="text-sm font-medium mb-1">Seed *</div>
          <Controller
            name="schema.seedScript"
            control={control}
            render={() => <MonacoSql name="schema.seedScript" height={160} />}
          />
        </div>
      </div>

      {/* ③ 테스트케이스 */}
      <Cases />
    </section>
  );
};

const Cases: React.FC = () => {
  const { control, register, watch } = useFormContext();
  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: "testcases",
    keyName: "fieldKey",
  });

  const tcs = watch("testcases") || [];

  const addDefaultCase = () =>
    append({
      name: "",
      visibility: "PUBLIC",
      expectedSql: "",
      seedOverride: "",
      noteMd: "",
      sortNo: fields.length,
      // 확장 필드 기본값
      expectedMode: "RESULT_SET",
      expectedMetaJson: "",
      assertSql: "",
      expectedRows: undefined,
      orderSensitiveOverride: false,
    });

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">테스트케이스 *</div>
        <button type="button" className="button-primary text-xs" onClick={addDefaultCase}>
          + 추가
        </button>
      </div>

      <div className="space-y-4">
        {fields.map((f, i) => {
          const mode = tcs?.[i]?.expectedMode as string | undefined;

          return (
            <div key={f.fieldKey} className="border rounded p-3 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium">이름 *</span>
                  <input className="input" {...register(`testcases.${i}.name` as const)} />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium">공개 *</span>
                  <select className="select" {...register(`testcases.${i}.visibility` as const)}>
                    {VIS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium">채점 모드 *</span>
                  <select className="select" {...register(`testcases.${i}.expectedMode` as const)}>
                    {MODES.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium">정렬번호</span>
                  <input
                    className="input"
                    type="number"
                    {...register(`testcases.${i}.sortNo` as const, { valueAsNumber: true })}
                  />
                </label>
              </div>

              {/* expectedSql — 여러 모드에서 사용 */}
              {(mode === "RESULT_SET" ||
                mode === "SQL_EQUAL" ||
                mode === "SQL_AST_PATTERN" ||
                mode === "AFFECTED_ROWS" ||
                !mode /* 초기값 보호 */) && (
                <div>
                  <div className="text-xs font-medium mb-1">expectedSql {mode === "RESULT_SET" || mode === "SQL_EQUAL" ? "*" : "(선택)"}</div>
                  <Controller
                    name={`testcases.${i}.expectedSql` as const}
                    control={control}
                    render={() => <MonacoSql name={`testcases.${i}.expectedSql`} height={150} />}
                  />
                </div>
              )}

              {/* 모드별 추가 필드 */}
              {mode === "SQL_AST_PATTERN" && (
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium">expectedMetaJson (필수: 패턴 규칙 JSON)</span>
                  <textarea
                    className="textarea font-mono"
                    rows={3}
                    placeholder='{"requiredPatterns":["GROUP BY"],"forbiddenPatterns":["SELECT *"]}'
                    {...register(`testcases.${i}.expectedMetaJson` as const)}
                  />
                </label>
              )}

              {mode === "RESULT_SET" && (
                <>
                  <div>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="checkbox"
                        {...register(`testcases.${i}.orderSensitiveOverride` as const)}
                      />
                      <span className="text-xs">이 케이스만 정렬 민감 적용</span>
                    </label>
                  </div>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium">expectedMetaJson (옵션)</span>
                    <textarea
                      className="textarea font-mono"
                      rows={3}
                      placeholder='{"tolerance":1e-6,"checkColumnNames":false}'
                      {...register(`testcases.${i}.expectedMetaJson` as const)}
                    />
                  </label>
                </>
              )}

              {mode === "AFFECTED_ROWS" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium">expectedRows *</span>
                    <input
                      type="number"
                      className="input"
                      {...register(`testcases.${i}.expectedRows` as const, { valueAsNumber: true })}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium">assertSql (옵션)</span>
                    <Controller
                      name={`testcases.${i}.assertSql` as const}
                      control={control}
                      render={() => <MonacoSql name={`testcases.${i}.assertSql`} height={120} />}
                    />
                  </label>
                </div>
              )}

              {(mode === "STATE_SNAPSHOT" || mode === "CUSTOM_ASSERT") && (
                <div>
                  <div className="text-xs font-medium mb-1">assertSql *</div>
                  <Controller
                    name={`testcases.${i}.assertSql` as const}
                    control={control}
                    render={() => <MonacoSql name={`testcases.${i}.assertSql`} height={140} />}
                  />
                </div>
              )}

              {/* seedOverride / noteMd 공통 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-medium mb-1">Seed Override (옵션) — 기본 Seed 대체</div>
                  <Controller
                    name={`testcases.${i}.seedOverride` as const}
                    control={control}
                    render={() => <MonacoSql name={`testcases.${i}.seedOverride`} height={120} />}
                  />
                </div>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium">비고(옵션)</span>
                  <textarea className="textarea" rows={2} {...register(`testcases.${i}.noteMd` as const)} />
                </label>
              </div>

              {/* 정렬/삭제 */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="button-secondary text-xs"
                    onClick={() => i > 0 && swap(i, i - 1)}
                    disabled={i === 0}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="button-secondary text-xs"
                    onClick={() => i < fields.length - 1 && swap(i, i + 1)}
                    disabled={i === fields.length - 1}
                  >
                    ↓
                  </button>
                </div>
                <button
                  type="button"
                  className="button-ghost text-red-600 text-xs"
                  onClick={() => remove(i)}
                  disabled={fields.length <= 1}
                >
                  삭제
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default DataAndTestSection;
