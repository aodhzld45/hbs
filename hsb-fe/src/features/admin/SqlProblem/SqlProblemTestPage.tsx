import React, { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";

// 관리자 정보 불러오기
import { useAuth } from '../../../context/AuthContext';

// --- Types (adjust to match your DTO exactly) ---
// If you already have shared types, replace these.
export type ConstraintRule =
  | "SELECT_ONLY"
  | "DML_ALLOWED"
  ;

  const enumOptions: ConstraintRule[] = [
  "SELECT_ONLY",
  "DML_ALLOWED",
];

interface ProblemRequest {
  title: string;
  level: number | undefined;
  tags: string[];
  descriptionMd: string;
  constraintRule?: ConstraintRule; // optional in case backend allows null
  orderSensitive: boolean;
  useTf?: string; // optional – depends on your DTO validation (Y/N)
}



// Toggle this if you want to try form-data endpoint
// POST /api/sql-problems/form?adminId=... (uses @ModelAttribute)
// default is JSON endpoint: POST /api/sql-problems?adminId=...

export default function SqlProblemTestPage() {
  const admin = useAuth();
  const [adminId, setAdminId] = useState(admin.admin?.id || null);
  const [sendAs, setSendAs] = useState<"json" | "form">("json");

  const [title, setTitle] = useState("");
  const [level, setLevel] = useState<number | "">(1);
  const [tagsInput, setTagsInput] = useState("");
  const [descriptionMd, setDescriptionMd] = useState("");
  const [constraintRule, setConstraintRule] = useState<ConstraintRule | "">("");
  const [orderSensitive, setOrderSensitive] = useState(false);
  const [useTf, setUseTf] = useState<"Y" | "N">("Y");

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tags = useMemo(() =>
    tagsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  [tagsInput]);

  const payload: ProblemRequest = useMemo(
    () => ({
      title,
      level: typeof level === "number" ? level : undefined,
      tags,
      descriptionMd,
      constraintRule: (constraintRule || undefined) as ConstraintRule | undefined,
      orderSensitive,
      useTf,
    }),
    [title, level, tags, descriptionMd, constraintRule, orderSensitive, useTf]
  );
  
const handleSubmit = async () => {
  setSubmitting(true);
  setError(null);
  setResult(null);

  try {
    let res;
    if (sendAs === "json") {
      // ✅ JSON: POST /api/sql-problems + adminId는 params로
      res = await api.post(
        '/admin/sql-problems',
        payload,
        { params: { adminId } }
      );

    } else {
      // ✅ FORM-DATA: POST /api/sql-problems/form + adminId는 params로
      const fd = new FormData();
      fd.append("title", title);
      if (typeof level === "number") fd.append("level", String(level));

      // 🔹 List<String> tags 바인딩: 반복 key 방식 권장
      //   (CSV는 일반적으로 자동 분할되지 않으니 주석 처리 권장)
      // fd.append("tags", tags.join(",")); // <- 보통은 안 나뉨
      tags.forEach(t => fd.append("tags", t)); // <- 이 방식이 Spring 표준

      fd.append("descriptionMd", descriptionMd);
      if (constraintRule) fd.append("constraintRule", String(constraintRule));
      fd.append("orderSensitive", String(orderSensitive));
      if (useTf) fd.append("useTf", useTf);

      res = await api.post(
        '/admin/sql-problems/form',
        fd,
        {
          params: { adminId },
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
    }

    setResult(`생성 성공! id = ${res.data}`);
  } catch (e: any) {
    const msg = e?.response?.data || e?.message || "요청 실패";
    setError(typeof msg === "string" ? msg : JSON.stringify(msg));
  } finally {
    setSubmitting(false);
  }
};


    useEffect(() => {
      setAdminId(admin.admin?.id || null);
    }, []);

  return (
    <div className="min-h-screen w-full bg-gray-950 text-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">SQL 문제 등록 테스트</h1>
          <div className="flex items-center gap-3">
            <select
              className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700"
              value={sendAs}
              onChange={(e) => setSendAs(e.target.value as any)}
              title="요청 포맷"
            >
              <option value="json">JSON (POST /api/sql-problems)</option>
              <option value="form">Form-Data (POST /api/sql-problems/form)</option>
            </select>
            <input
              className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700"
              placeholder="adminId"
              value={adminId ?? ""}
              onChange={(e) => setAdminId(e.target.value)}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-gray-400">제목 *</span>
              <input
                className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예) Join과 Group By"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm text-gray-400">난이도(level)</span>
              <input
                type="number"
                min={1}
                className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700"
                value={level}
                onChange={(e) => setLevel(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="예) 1"
              />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-gray-400">태그(쉼표로 구분)</span>
            <input
              className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="join, group-by, aggregate"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-gray-400">설명 (Markdown)</span>
            <textarea
              className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 h-40"
              value={descriptionMd}
              onChange={(e) => setDescriptionMd(e.target.value)}
              placeholder={"문제 설명을 적어주세요 (Markdown 지원)"}
            />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-gray-400">제약 규칙(constraintRule)</span>
              <select
                className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700"
                value={constraintRule}
                onChange={(e) => setConstraintRule((e.target.value as ConstraintRule) || "" as any)}
              >
                <option value="">(선택)</option>
                {enumOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={orderSensitive}
                onChange={(e) => setOrderSensitive(e.target.checked)}
              />
              <span className="text-sm">정답 순서 민감(Order Sensitive)</span>
            </label>

            <label className="flex items-center gap-3">
              <span className="text-sm text-gray-400">사용여부</span>
              <select
                className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700"
                value={useTf}
                onChange={(e) => setUseTf(e.target.value as any)}
              >
                <option value="Y">Y</option>
                <option value="N">N</option>
              </select>
            </label>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60"
              onClick={handleSubmit}
              disabled={submitting || !title}
              title={!title ? "제목은 필수입니다" : "등록"}
            >
              {submitting ? "등록 중..." : "문제 등록"}
            </button>
            <button
              className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700"
              onClick={() => {
                setTitle("");
                setLevel(1);
                setTagsInput("");
                setDescriptionMd("");
                setConstraintRule("");
                setOrderSensitive(false);
                setUseTf("Y");
                setResult(null);
                setError(null);
              }}
            >
              초기화
            </button>
          </div>

          {/* Preview Card */}
          <div className="mt-6 rounded-2xl border border-gray-800 bg-gray-900 p-4">
            <h2 className="text-lg font-semibold mb-2">요청 미리보기</h2>
            <p className="text-sm mb-2">
              <span className="opacity-70">POST</span> {sendAs === "json" ? "/sql-problems" : "/sql-problems/form"}
              <span className="opacity-70">?adminId=</span>
              <code className="ml-1">{adminId}</code>
            </p>
            <pre className="text-xs overflow-auto max-h-64 p-3 bg-black/40 rounded-lg">
{JSON.stringify(payload, null, 2)}
            </pre>
          </div>

          {/* Result / Error */}
          {result && (
            <div className="mt-4 rounded-xl border border-emerald-700 bg-emerald-900/30 p-3 text-emerald-200">
              {result}
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-xl border border-rose-700 bg-rose-900/30 p-3 text-rose-200">
              {error}
            </div>
          )}

          <footer className="mt-10 text-xs text-gray-500">
            • 백엔드가 같은 오리진에서 동작한다고 가정했습니다. 프록시/도메인 환경이면 axios baseURL 또는 프록시 설정을 맞춰주세요.
          </footer>
        </div>
      </div>
    </div>
  );
}
