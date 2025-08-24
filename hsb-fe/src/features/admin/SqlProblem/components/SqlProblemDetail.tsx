import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import AdminLayout from "../../../../components/Layout/AdminLayout";
import { useAuth } from "../../../../context/AuthContext";

import {
  fetchProblemDetail,
  fetchProblemToggleUseTf,
  fetchProblemUpdate,
} from "../services/sqlProblemApi";

import SqlProblemFormModal from "../components/SqlProblemFormModal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** 서버 상세 응답 타입(필요 필드만) – ProblemPayload와 호환되게 */
export interface DetailData {
  id: number;
  title: string;
  level?: number;
  tags?: string[];
  descriptionMd?: string; // ← 핵심: 본문 마크다운
  constraintRule: "SELECT_ONLY" | "DML_ALLOWED";
  orderSensitive?: boolean;
  useTf: "Y" | "N";
  visibility?: "PUBLIC" | "HIDDEN";
  regDate?: string;
  // 아래는 필요 시 확장
  // schema?: SqlSchemaPayload;
  // testcases?: SqlTestcasePayload[];
}

const AdminSqlProblemDetail: React.FC = () => {
  const { id } = useParams();
  const { state } = useLocation() as { state?: { preload?: Partial<DetailData> } };
  const preload = state?.preload;

  const { admin } = useAuth();

  const [data, setData] = useState<DetailData | null>(
    preload && (preload as any).id ? (preload as DetailData) : null
  );
  const [loading, setLoading] = useState(!preload);
  const [editOpen, setEditOpen] = useState(false);

  // 상세 조회 (preload 있으면 즉시 렌더 + 백그라운드 리프레시)
  useEffect(() => {
    if (!id) return;
    (async () => {
      if (!preload) setLoading(true);
      try {
        const fresh = await fetchProblemDetail(Number(id));
        // fetchProblemDetail가 descriptionMd 대신 다른 키를 준다면 여기서 매핑
        // const normalized = { ...fresh, descriptionMd: fresh.statementMarkdown ?? fresh.descriptionMd };
        setData({ ...(fresh as unknown as DetailData), id: Number(id) });
      } finally {
        if (!preload) setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading && !data) return <AdminLayout><div className="p-6">로딩중…</div></AdminLayout>;

  if (!data) {
    return (
      <AdminLayout>
        <div className="p-6">
          존재하지 않는 문제입니다.{" "}
          <Link to="/admin/sql-problems" className="text-blue-600 underline">
            목록으로
          </Link>
        </div>
      </AdminLayout>
    );
  }

  // 상단 우측 관리자 툴바
  const Toolbar = (
    <div className="flex items-center gap-2">
      {/* 사용 여부 토글 */}
      <button
        className="px-3 py-1.5 rounded border text-sm"
        onClick={async () => {
          if (!admin?.id) return alert("관리자 인증 정보가 없습니다.");
          const next: "Y" | "N" = data.useTf === "Y" ? "N" : "Y";
          await fetchProblemToggleUseTf(data.id, next, admin.id);
          const fresh = await fetchProblemDetail(data.id);
          setData(fresh as unknown as DetailData);
        }}
      >
        {data.useTf === "Y" ? "사용중" : "미사용"}
      </button>

      {/* 수정 모달 열기 */}
      <button
        className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm"
        onClick={() => setEditOpen(true)}
      >
        수정
      </button>

      {/* 사용자 미리보기 */}
      <a
        className="px-3 py-1.5 rounded border text-sm"
        href={`/practice/sql/${data.id}`}
        target="_blank"
        rel="noreferrer"
      >
        사용자 미리보기
      </a>
    </div>
  );

  return (
    <AdminLayout>
      <main className="max-w-5xl mx-auto p-4 md:p-6">
        {/* 헤더 */}
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{data.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {!!data.level && (
                <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
                  LV{data.level}
                </span>
              )}
              {!!data.constraintRule && (
                <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                  {data.constraintRule}
                </span>
              )}
              {data.visibility === "HIDDEN" && (
                <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                  비공개
                </span>
              )}
              {(data.tags ?? []).map((t) => (
                <span key={t} className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  #{t}
                </span>
              ))}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              등록일 {data.regDate?.slice(0, 10) ?? "-"}
            </div>
          </div>
          {Toolbar}
        </header>

        {/* 본문 – descriptionMd 표출 */}
        <section className="prose max-w-none bg-white p-4 md:p-6 rounded-xl border">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {data.descriptionMd || "문제 설명이 없습니다."}
          </ReactMarkdown>
        </section>

        {/* 필요 시: 스키마/예시/제출기록 탭 확장 가능 */}
        {/* <Tabs .../> */}

        {/* 하단 네비 */}
        <div className="mt-6">
          <Link
            to="/admin/sql-problems"
            className="px-3 py-2 rounded border hover:bg-gray-50"
          >
            목록으로
          </Link>
        </div>
      </main>

      {/* 수정 모달 – 기존 폼 재사용 */}
      <SqlProblemFormModal
        open={editOpen}
        initial={{
          ...data,
          useTf: data.useTf, // 타입 가드
        }}
        onClose={() => setEditOpen(false)}
        onSubmit={async (payload) => {
          if (!admin?.id) {
            alert("관리자 인증 정보가 없습니다.");
            throw new Error("no admin");
          }
          // payload는 ProblemPayload (descriptionMd 포함)
          await fetchProblemUpdate(data.id, payload, admin.id);
          setEditOpen(false);
          const fresh = await fetchProblemDetail(data.id);
          setData(fresh as unknown as DetailData);
        }}
      />
    </AdminLayout>
  );
};

export default AdminSqlProblemDetail;
