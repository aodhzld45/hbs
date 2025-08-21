import React, { useMemo, useEffect, Fragment, useRef } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Disclosure, Transition } from "@headlessui/react";
import { ChevronUp } from "lucide-react";
import ProblemPreview from "./ProblemPreview";

type DescMode = "GUIDED" | "MARKDOWN";

/** =========================
 *  Markdown → Guided 역파서
 *  ========================= */
type GuidedTable = {
  name: string;
  columns: { name: string; type: string; nullable: boolean }[];
};

type GuidedParsed = {
  intro: string;
  requirements: string[];
  sampleInputRef: string;
  expectedOutputHint: string;
  notes: string;
  tables: GuidedTable[];
  orderSensitive: boolean;
};

function parseDescriptionMd(md: string): GuidedParsed {
  const src = (md ?? "").replace(/\r\n/g, "\n").trim();

  const idxReq = indexOfHeader(src, "### 요구 사항");
  const idxTbl = indexOfHeader(src, "### 테이블 정의");
  const idxSample = indexOfHeader(src, "### 샘플 입력");
  const idxSampleAlt = indexOfHeader(src, "### 샘플 입력(참고)");
  const idxHint = indexOfHeader(src, "### 기대 결과");
  const idxHintAlt = indexOfHeader(src, "### 기대 결과(힌트)");
  const idxNotes = indexOfHeader(src, "### 비고");

  const sec = (start: number, endCandidates: number[]) =>
    sliceSection(src, start, endCandidates.filter((n) => n >= 0));

  const firstSectionIdx =
    [idxTbl, idxReq, idxSample, idxSampleAlt, idxHint, idxHintAlt, idxNotes]
      .filter((n) => n >= 0)
      .sort((a, b) => a - b)[0] ?? src.length;

  const introBlock = src.slice(0, firstSectionIdx).trim();
  const intro = stripBlockquotes(introBlock).split(/\n{2,}/)[0]?.trim() ?? "";

  const reqBlock = sec(idxReq, [idxTbl, idxSample, idxSampleAlt, idxHint, idxHintAlt, idxNotes, src.length]);
  const requirements = extractMdList(reqBlock);

  const tblBlock = sec(idxTbl, [idxReq, idxSample, idxSampleAlt, idxHint, idxHintAlt, idxNotes, src.length]);
  const tables = parseTables(tblBlock);

  const sampleBlock = sec((idxSample >= 0 ? idxSample : idxSampleAlt), [idxReq, idxTbl, idxHint, idxHintAlt, idxNotes, src.length]);
  const sampleInputRef = extractSingleLine(sampleBlock);

  const hintBlock = sec((idxHint >= 0 ? idxHint : idxHintAlt), [idxReq, idxTbl, idxSample, idxSampleAlt, idxNotes, src.length]);
  const expectedOutputHint = hintBlock.trim();

  const notesBlock = sec(idxNotes, [idxReq, idxTbl, idxSample, idxSampleAlt, idxHint, idxHintAlt, src.length]);
  const notes = notesBlock.trim();

  const orderSensitive = /정렬이\s*채점에\s*중요/i.test(src);

  return {
    intro,
    requirements,
    sampleInputRef,
    expectedOutputHint,
    notes,
    tables,
    orderSensitive,
  };
}

function indexOfHeader(src: string, header: string): number {
  const re = new RegExp(`^\\s*${escapeReg(header)}\\s*$`, "mi");
  const m = src.match(re);
  return m?.index ?? -1;
}
function sliceSection(src: string, startIdx: number, nextIdxList: number[]): string {
  if (startIdx < 0) return "";
  const from = src.indexOf("\n", startIdx);
  const to = nextIdxList
    .filter((n) => n > startIdx)
    .sort((a, b) => a - b)[0];
  return src.slice(from >= 0 ? from + 1 : startIdx, to ?? src.length).trim();
}
function extractMdList(block: string): string[] {
  const lines = block.split("\n");
  const items: string[] = [];
  for (const line of lines) {
    const m = line.match(/^\s*[-*+]\s+(.*)$/);
    if (m) items.push(m[1].trim());
  }
  return items;
}
function parseTables(block: string): GuidedTable[] {
  const lines = block.split("\n");
  const tables: GuidedTable[] = [];
  let i = 0;
  while (i < lines.length) {
    const bold = lines[i].match(/^\s*\*\*(.+?)\*\*\s*$/);
    if (bold) {
      const name = bold[1].trim();
      i++;
      while (i < lines.length && /^\s*$/.test(lines[i])) i++;
      if (
        i + 1 < lines.length &&
        /\|\s*Column name\s*\|/i.test(lines[i]) &&
        /^\s*\|[-\s|]+\|\s*$/.test(lines[i + 1])
      ) {
        i += 2;
        const cols: GuidedTable["columns"] = [];
        while (i < lines.length && /^\s*\|/.test(lines[i])) {
          const cells = lines[i].trim().slice(1, -1).split("|").map((s) => s.trim());
          const [cname, ctype, cnull] = cells;
          cols.push({
            name: cname ?? "",
            type: ctype ?? "",
            nullable: /^true$/i.test(cnull ?? ""),
          });
          i++;
        }
        tables.push({ name, columns: cols });
        continue;
      }
    }
    i++;
  }
  return tables;
}
function extractSingleLine(block: string): string {
  const m1 = block.match(/^\s*[-*+]\s+(.*)$/m);
  if (m1) return m1[1].trim();
  const line = block.split("\n").find((l) => l.trim().length > 0);
  return line?.trim() ?? "";
}
function stripBlockquotes(block: string): string {
  return block.replace(/^\s*>\s?/gm, "");
}
function escapeReg(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** =========================
 *  UI
 *  ========================= */
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
            <ChevronUp className={`${open ? "rotate-180 transform" : ""} w-4 h-4 text-gray-500`} />
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
  const { register, control, watch, setValue, getValues } = useFormContext();
  const descMode: DescMode = watch("descMode") ?? "GUIDED";

  const guidedIntro = watch("guided.intro") || "";
  const guidedRequirements: string[] = watch("guided.requirements") || [];
  const guidedNotes = watch("guided.notes") || "";
  const sampleInputRef = watch("guided.sampleInputRef") || "";
  const expectedOutputHint = watch("guided.expectedOutputHint") || "";
  const orderSensitive = watch("orderSensitive") ?? false;
  const guidedTables = watch("guided.tables") || [];
  const descriptionMd = watch("descriptionMd") || "";

  // 사용자가 수동 입력을 시작한 뒤에는 역바인딩을 다시 안 하도록 guard
  const didHydrateGuided = useRef(false);

  // 현재 guided가 비어있는지 판단 (intro/requirements/tables 모두 비었으면 비어있음으로 간주)
  const isGuidedEmpty = (): boolean => {
    const g = getValues("guided") as any;
    const noIntro = !g?.intro || !String(g.intro).trim();
    const noReq = !Array.isArray(g?.requirements) || g.requirements.every((r: string) => !String(r).trim());
    const noTables = !Array.isArray(g?.tables) || g.tables.length === 0;
    const noNotes = !g?.notes || !String(g.notes).trim();
    const noSample = !g?.sampleInputRef || !String(g.sampleInputRef).trim();
    const noHint = !g?.expectedOutputHint || !String(g.expectedOutputHint).trim();
    return noIntro && noReq && noTables && noNotes && noSample && noHint;
  };

  /** --------------------------------------------
   *  (1) Markdown → Guided 역바인딩 (최초 1회)
   *  - descMode가 GUIDED이고
   *  - descriptionMd가 존재하며
   *  - guided가 아직 비어있을 때만 수행
   *  -------------------------------------------- */
  useEffect(() => {
    if (didHydrateGuided.current) return;
    if (descMode !== "GUIDED") return;
    if (!descriptionMd || !descriptionMd.trim()) return;
    if (!isGuidedEmpty()) return;

    const parsed = parseDescriptionMd(descriptionMd);

    // 역바인딩
    setValue("guided.intro", parsed.intro ?? "", { shouldDirty: true });
    setValue("guided.requirements", parsed.requirements?.length ? parsed.requirements : [""], { shouldDirty: true });
    setValue("guided.sampleInputRef", parsed.sampleInputRef ?? "", { shouldDirty: true });
    setValue("guided.expectedOutputHint", parsed.expectedOutputHint ?? "", { shouldDirty: true });
    setValue("guided.notes", parsed.notes ?? "", { shouldDirty: true });
    setValue("guided.tables", parsed.tables ?? [], { shouldDirty: true });
    setValue("orderSensitive", !!parsed.orderSensitive, { shouldDirty: true });

    didHydrateGuided.current = true;
  }, [descMode, descriptionMd, setValue, getValues]);

  /** --------------------------------------------
   *  (2) Guided → Markdown 자동 합성
   *  -------------------------------------------- */
  const composedMd = useMemo(() => {
    const lines: string[] = [];
    if (guidedIntro.trim()) lines.push(guidedIntro.trim(), "");

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
            `| ${col.name || ""} | ${col.type || ""} | ${col.nullable ? "TRUE" : "FALSE"} |`
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
                      <div className="space-y-2">
                        {tbl.columns?.map((col: any, j: number) => (
                          <div key={j} className="grid grid-cols-3 gap-2 items-center">
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
                                checked={!!col.nullable}
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
                            next[i].columns = next[i].columns || [];
                            next[i].columns.push({ name: "", type: "", nullable: false });
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
                      field.onChange([...(field.value || []), { name: "", columns: [] }])
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
                    onClick={() => field.onChange([...(field.value || []), ""])}
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
