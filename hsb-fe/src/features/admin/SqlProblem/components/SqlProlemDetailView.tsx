import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export type DetailData = {
  descriptionMd: string;
  constraintRule: any;
  useTf: string;
  id: number;
  title: string;
  level?: number;
  rule?: "SELECT_ONLY" | "DML_ALLOWED";
  visibility?: "PUBLIC" | "HIDDEN";
  tags?: string[];
  regDate?: string;
  statementMarkdown?: string;
  schemas?: Array<{
    tableName: string;
    columns: Array<{ name: string; type: string; nullable: boolean; comment?: string }>;
    sampleRows?: any[];
  }>;
  examples?: Array<{ inputSql?: string; outputTable?: Array<Record<string, any>> }>;
  mySubmissions?: Array<{ submissionId: number; status: "AC"|"WA"|"RE"|"CE"|"TLE"; runtimeMs?: number; createdAt: string }>;
};

type Props = {
  data: DetailData;
  tab: "desc" | "schema" | "examples" | "subs";
  onChangeTab: (t: Props["tab"]) => void;
  rightSlot?: React.ReactNode; // ← 관리자 툴바/CTA 등 주입
};

const SqlProblemDetailView: React.FC<Props> = ({ data, tab, onChangeTab, rightSlot }) => {
  const tags = useMemo(() => data.tags ?? [], [data]);
  return (
    <main className="max-w-5xl mx-auto p-4 md:p-6">
      {/* 헤더 */}
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{data.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {!!data.level && <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">LV{data.level}</span>}
            {!!data.rule && <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">{data.rule}</span>}
            {data.visibility === "HIDDEN" && <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700">비공개</span>}
            {tags.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">#{t}</span>)}
          </div>
          <div className="mt-1 text-xs text-gray-500">등록일 {data.regDate?.slice(0,10) ?? "-"}</div>
        </div>

        {/* 우측 슬롯: 관리자 툴바/CTA */}
        {rightSlot}
      </header>

      {/* 탭 */}
      <div className="border-b flex gap-4 mb-4">
        {(["desc","schema","examples","subs"] as const).map(t => (
          <button key={t}
            className={`-mb-px px-3 py-2 border-b-2 ${tab===t ? "border-blue-600 text-blue-700":"border-transparent text-gray-600 hover:text-gray-800"}`}
            onClick={() => onChangeTab(t)}
          >
            {t==="desc"?"설명":t==="schema"?"스키마":t==="examples"?"예시":"제출 기록"}
          </button>
        ))}
      </div>

      {/* 본문 */}
      <section className="grid grid-cols-1 gap-6">
        {tab==="desc" && (
          <div className="prose max-w-none bg-white p-4 md:p-6 rounded-xl border">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
{data.statementMarkdown || "문제 설명이 없습니다."}
            </ReactMarkdown>
          </div>
        )}

        {tab==="schema" && (
          <div className="space-y-6">
            {(data.schemas ?? []).length===0 && <Empty msg="스키마 정보가 없습니다."/>}
            {(data.schemas ?? []).map(s => (
              <div key={s.tableName} className="border rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-gray-50 font-semibold">{s.tableName}</div>
                <div className="p-4 overflow-x-auto">
                  <table className="min-w-[640px] w-full border text-sm">
                    <thead className="bg-gray-50">
                      <tr><Th>Name</Th><Th>Type</Th><Th>Nullable</Th><Th>Comment</Th></tr>
                    </thead>
                    <tbody>
                      {s.columns.map(c=>(
                        <tr key={c.name} className="odd:bg-white even:bg-gray-50">
                          <Td>{c.name}</Td><Td>{c.type}</Td><Td>{c.nullable?"YES":"NO"}</Td><Td>{c.comment ?? "-"}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==="examples" && (
          <div className="space-y-6">
            {!(data.examples?.length) && <Empty msg="예시 데이터가 없습니다."/>}
            {(data.examples ?? []).map((ex,i)=>(
              <div key={i} className="border rounded-xl p-4">
                {ex.inputSql && (<>
                  <div className="text-sm text-gray-600 mb-1">예시 입력 SQL</div>
                  <pre className="bg-gray-900 text-gray-50 rounded p-3 overflow-auto text-xs">{ex.inputSql}</pre>
                </>)}
                {!!ex.outputTable?.length && (<>
                  <div className="text-sm text-gray-600 mt-3 mb-1">예시 출력</div>
                  <TablePreview rows={ex.outputTable}/>
                </>)}
              </div>
            ))}
          </div>
        )}

        {tab==="subs" && (
          <div className="overflow-x-auto">
            {!(data.mySubmissions?.length) ? <Empty msg="제출 기록이 없습니다."/> : (
              <table className="min-w-[680px] w-full border text-sm">
                <thead className="bg-gray-50">
                  <tr><Th>ID</Th><Th>상태</Th><Th>실행시간(ms)</Th><Th>제출일</Th></tr>
                </thead>
                <tbody>
                  {data.mySubmissions!.map(s=>(
                    <tr key={s.submissionId} className="odd:bg-white even:bg-gray-50">
                      <Td>#{s.submissionId}</Td>
                      <Td>{s.status}</Td>
                      <Td>{s.runtimeMs ?? "-"}</Td>
                      <Td>{s.createdAt?.slice(0,19).replace("T"," ")}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </section>
    </main>
  );
};

const Th: React.FC<{children:React.ReactNode}> = ({children}) => <th className="p-2 border text-left">{children}</th>;
const Td: React.FC<{children:React.ReactNode}> = ({children}) => <td className="p-2 border align-top">{children}</td>;
const Empty = ({msg}:{msg:string}) => <div className="p-6 text-center text-gray-500 border rounded-xl bg-white">{msg}</div>;

const TablePreview = ({ rows }: { rows: Array<Record<string, any>> }) => {
  if (!rows.length) return null;
  const cols = Object.keys(rows[0]);
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[560px] w-full border text-sm">
        <thead className="bg-gray-50"><tr>{cols.map(c=><Th key={c}>{c}</Th>)}</tr></thead>
        <tbody>{rows.map((r,i)=>(
          <tr key={i} className="odd:bg-white even:bg-gray-50">
            {cols.map(c=><Td key={c}>{String(r[c])}</Td>)}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
};

export default SqlProblemDetailView;