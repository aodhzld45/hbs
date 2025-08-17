import React, { useMemo, useEffect, Fragment } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Disclosure, Transition } from "@headlessui/react";
import { ChevronUp } from "lucide-react";
import ProblemPreview from "./ProblemPreview";

type DescMode = "GUIDED" | "MARKDOWN";

const AccordionItem: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => {
  return (
    <Disclosure as="div" className="border rounded-md">
      {({ open }) => (
        <>
          <Disclosure.Button className="flex justify-between w-full px-4 py-2 text-sm font-bold text-left text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none">
            {title}
            <ChevronUp
              className={`${
                open ? "rotate-180 transform" : ""
              } w-4 h-4 text-gray-500`}
            />
          </Disclosure.Button>
          <Transition
            as={Fragment}
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Disclosure.Panel className="px-4 py-3 text-sm text-gray-700 space-y-2">
              {children}
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
};

const StatementSection: React.FC = () => {
  const { register, control, watch, setValue } = useFormContext();
  const descMode: DescMode = watch("descMode") ?? "GUIDED";

  const guidedIntro = watch("guided.intro") || "";
  const guidedRequirements: string[] = watch("guided.requirements") || [];
  const guidedNotes = watch("guided.notes") || "";
  const sampleInputRef = watch("guided.sampleInputRef") || "";
  const expectedOutputHint = watch("guided.expectedOutputHint") || "";
  const orderSensitive = watch("orderSensitive") ?? false;
  const guidedTables = watch("guided.tables") || []; // NEW: 테이블 정의

  // 자동 합성
  const composedMd = useMemo(() => {
    const lines: string[] = [];
    if (guidedIntro.trim()) lines.push(guidedIntro.trim(), "");

    // === DB 테이블 정의 ===
    if (guidedTables.length > 0) {
      lines.push("### 테이블 정의", "");
      guidedTables.forEach((t: any) => {
        if (!t.name) return;
        lines.push(`**${t.name}**`);
        lines.push("");
        lines.push("| Column name | Type | Nullable |");
        lines.push("|-------------|------|----------|");
        t.columns?.forEach((col: any) => {
          lines.push(
            `| ${col.name || ""} | ${col.type || ""} | ${
              col.nullable ? "TRUE" : "FALSE"
            } |`
          );
        });
        lines.push("");
      });
    }

    if (guidedRequirements.length > 0) {
      lines.push("### 요구 사항", "");
      guidedRequirements.forEach((req) => req && lines.push(`- ${req}`));
      lines.push("");
    }
    if (sampleInputRef.trim()) {
      lines.push("### 샘플 입력(참고)", "", `- ${sampleInputRef.trim()}`, "");
    }
    if (expectedOutputHint.trim()) {
      lines.push("### 기대 결과(힌트)", "", expectedOutputHint.trim(), "");
    }
    if (orderSensitive) {
      lines.push("> ⚠️ 결과 행/열의 **정렬이 채점에 중요**합니다.", "");
    }
    if (guidedNotes.trim()) {
      lines.push("### 비고", "", guidedNotes.trim(), "");
    }
    return lines.join("\n");
  }, [
    guidedIntro,
    guidedTables,
    guidedRequirements,
    sampleInputRef,
    expectedOutputHint,
    guidedNotes,
    orderSensitive,
  ]);

  useEffect(() => {
    if (descMode === "GUIDED") {
      setValue("descriptionMd", composedMd, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [descMode, composedMd, setValue]);

  return (
    <section className="p-4 rounded-xl border bg-white">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">문제 설명</h4>
        <button
          type="button"
          className="text-xs text-blue-600"
          onClick={() =>
            setValue("descMode", descMode === "GUIDED" ? "MARKDOWN" : "GUIDED")
          }
        >
          {descMode === "GUIDED" ? "고급 모드(마크다운)" : "간단 모드(폼)"}
        </button>
      </div>

      {descMode === "GUIDED" ? (
        <div className="space-y-3">
          <AccordionItem title="문제 소개">
            <textarea
              className="textarea w-full"
              rows={3}
              {...register("guided.intro")}
            />
          </AccordionItem>

          {/* === NEW: DB 테이블 정의 === */}
          <AccordionItem title="테이블 정의">
            <Controller
              name="guided.tables"
              control={control}
              render={({ field }) => (
                <div className="space-y-4">
                  {field.value?.map((tbl: any, i: number) => (
                    <div key={i} className="border p-2 rounded space-y-2">
                      <input
                        className="input w-full"
                        placeholder="테이블 이름"
                        value={tbl.name}
                        onChange={(e) => {
                          const next = [...field.value];
                          next[i] = { ...tbl, name: e.target.value };
                          field.onChange(next);
                        }}
                      />
                      {/* 컬럼들 */}
                      <div className="space-y-2">
                        {tbl.columns?.map((col: any, j: number) => (
                          <div
                            key={j}
                            className="grid grid-cols-3 gap-2 items-center"
                          >
                            <input
                              className="input"
                              placeholder="컬럼명"
                              value={col.name}
                              onChange={(e) => {
                                const next = [...field.value];
                                next[i].columns[j].name = e.target.value;
                                field.onChange(next);
                              }}
                            />
                            <input
                              className="input"
                              placeholder="타입"
                              value={col.type}
                              onChange={(e) => {
                                const next = [...field.value];
                                next[i].columns[j].type = e.target.value;
                                field.onChange(next);
                              }}
                            />
                            <label className="flex items-center gap-1 text-xs">
                              <input
                                type="checkbox"
                                checked={col.nullable}
                                onChange={(e) => {
                                  const next = [...field.value];
                                  next[i].columns[j].nullable = e.target.checked;
                                  field.onChange(next);
                                }}
                              />
                              Nullable
                            </label>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="button-secondary text-xs"
                          onClick={() => {
                            const next = [...field.value];
                            next[i].columns.push({
                              name: "",
                              type: "",
                              nullable: false,
                            });
                            field.onChange(next);
                          }}
                        >
                          + 컬럼 추가
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="button-primary text-xs"
                    onClick={() =>
                      field.onChange([
                        ...(field.value || []),
                        { name: "", columns: [] },
                      ])
                    }
                  >
                    + 테이블 추가
                  </button>
                </div>
              )}
            />
          </AccordionItem>

          <AccordionItem title="요구사항">
            <Controller
              name="guided.requirements"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  {field.value?.map((req: string, i: number) => (
                    <input
                      key={i}
                      className="input w-full"
                      value={req}
                      onChange={(e) => {
                        const next = [...field.value];
                        next[i] = e.target.value;
                        field.onChange(next);
                      }}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      field.onChange([...(field.value || []), ""])
                    }
                    className="button-secondary"
                  >
                    + 추가
                  </button>
                </div>
              )}
            />
          </AccordionItem>

          <AccordionItem title="샘플 입력 / 기대 결과 힌트">
            <div className="grid grid-cols-2 gap-4">
              <input
                className="input"
                placeholder="샘플 입력"
                {...register("guided.sampleInputRef")}
              />
              <input
                className="input"
                placeholder="기대 결과 힌트"
                {...register("guided.expectedOutputHint")}
              />
            </div>
          </AccordionItem>

          <AccordionItem title="비고 / 추가 힌트">
            <textarea
              className="textarea w-full"
              rows={3}
              {...register("guided.notes")}
            />
          </AccordionItem>
        </div>
      ) : (
        <textarea
          className="textarea w-full"
          rows={10}
          {...register("descriptionMd")}
        />
      )}

    {/* 미리보기 */}
    <div className="mt-4 p-3 border rounded bg-gray-50">
      <h5 className="font-medium text-sm mb-2">미리보기</h5>
      <ProblemPreview
        title={watch("title") || "(제목 없음)"}
        level={watch("level")}
        tags={watch("tags") || []}
        descriptionMd={watch("descriptionMd") || ""}
      />
    </div>
    </section>
  );
};

export default StatementSection;
