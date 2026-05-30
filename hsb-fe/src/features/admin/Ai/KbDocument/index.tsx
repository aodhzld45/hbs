import { useEffect, useMemo, useRef, useState } from "react";
import AdminLayout from "../../../../components/Layout/AdminLayout";
import Pagination from "../../../../components/Common/Pagination";

import { useAdminPageHeader } from "../../Common/hooks/useAdminPageHeader";

import KbDocumentList from "./components/KbDocumentList";
import KbDocumentEditorForm from "./components/KbDocumentEditorForm";
import PageLoader from "../../../common/PageLoader";

import { useKbDocumentList } from "./hooks/useKbDocumentList";

import type {
  KbDocumentRequest,
  KbDocumentResponse,
} from "./types/KbDocumentConfig";

import {
  createKbDocument,
  fetchKbDocumentDetail,
  fetchKbDocumentJobStatus,
  updateKbDocument,
  toggleKbDocumentUseTf,
  deleteKbDocumentSoft,
  reindexKbDocument,
} from "./services/KbDocumentApi";

const ACTIVE_DOC_STATUSES = new Set(["READY", "UPLOADED", "INDEXING", "DELETE_PENDING"]);
const ACTIVE_JOB_STATUSES = new Set(["READY", "RUNNING"]);

function hasActiveKbJob(row: KbDocumentResponse) {
  const docStatus = (row.docStatus ?? "").toUpperCase();
  const jobStatus = (row.latestJobStatus ?? "").toUpperCase();
  return ACTIVE_DOC_STATUSES.has(docStatus) || ACTIVE_JOB_STATUSES.has(jobStatus);
}

export default function AdminKbDocument() {
  /* 공통 헤더/메뉴 처리 */
  const { currentMenuTitle, actorId, menuError } = useAdminPageHeader();

  /* 목록 훅 */
  const { params, setParams, data, loading, initialLoading, error, refetch, patchDocuments } = useKbDocumentList({
    page: 0,
    size: 20,
    sort: "regDate,desc",
  });

  const page = params.page ?? 0;
  const totalPages = data?.totalPages ?? 0;

  // 에디터 모달 상태
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<KbDocumentResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const statusPollingRef = useRef(false);

  const activeJobRows = useMemo(
    () => (data?.items ?? []).filter(hasActiveKbJob),
    [data?.items]
  );
  const hasActiveJobs = activeJobRows.length > 0;

  useEffect(() => {
    if (!hasActiveJobs) return;

    const timer = window.setInterval(() => {
      if (statusPollingRef.current) return;

      statusPollingRef.current = true;
      Promise.allSettled(activeJobRows.map((row) => fetchKbDocumentJobStatus(row.id)))
        .then((results) => {
          const updates = results
            .filter((result): result is PromiseFulfilledResult<KbDocumentResponse> => result.status === "fulfilled")
            .map((result) => result.value);

          patchDocuments(updates);
        })
        .finally(() => {
          statusPollingRef.current = false;
        });
    }, 5000);

    return () => window.clearInterval(timer);
  }, [activeJobRows, hasActiveJobs, patchDocuments]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const openCreate = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = async (row: KbDocumentResponse) => {
    try {
      setDetailLoading(true);
      const detail = await fetchKbDocumentDetail(row.id);
      setEditing(detail);
      setEditorOpen(true);
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "문서 상세 조회 실패");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditing(null);
  };

  /**
   * 저장(신규/수정)
   * - create/update는 multipart(body + file) 기준
   * - actorId는 query param(actor)로 전달
   */
  const handleSubmit = async (req: KbDocumentRequest, file?: File | null) => {
    try {
      if (editing) {
        await updateKbDocument(editing.id, req, String(actorId), file ?? null);
        setEditorOpen(false);
        setEditing(null);
        refetch();
        setNotice("문서가 저장되었습니다. 분석 작업은 백그라운드에서 계속 처리됩니다.");
        return;
      }  

      const created = await createKbDocument(req, String(actorId), file ?? null); // id 반환
      setEditorOpen(false);
      setEditing(null);
      refetch(); // 목록 갱신
      setNotice(`문서 #${created.id} 분석 작업이 백그라운드에서 시작되었습니다.`);
      
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "문서 저장 중 오류가 발생했습니다.");
    }
  };

  const handleReindex = async (row: KbDocumentResponse) => {
    if (!window.confirm(`"${row.title}" 문서를 다시 분석하시겠습니까?`)) return;
    try {
      await reindexKbDocument(row.id, actorId);
      refetch();
      setNotice("재분석 작업이 백그라운드에서 시작되었습니다.");
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "재분석 요청 중 오류가 발생했습니다.");
    }
  };

  /**
   * 소프트 삭제
   */
  const handleDelete = async (row: KbDocumentResponse) => {
    if (!window.confirm(`"${row.title}" 문서를 삭제하시겠습니까?`)) return;
    try {
      await deleteKbDocumentSoft(row.id, actorId);
      alert("삭제되었습니다.");
      refetch();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "삭제 중 오류가 발생했습니다.");
    }
  };

  /**
   * 사용여부 토글
   */
  const handleToggleUse = async (row: KbDocumentResponse) => {
    const nextUse: "Y" | "N" = row.useTf === "Y" ? "N" : "Y";
    try {
      await toggleKbDocumentUseTf(row.id, nextUse, actorId);
      refetch();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "사용여부 변경 중 오류가 발생했습니다.");
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">{currentMenuTitle}</h2>

        {menuError && (
          <div className="px-4 py-2 mb-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded">
            {menuError}
          </div>
        )}

        {notice && (
          <div className="px-4 py-2 mb-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded">
            {notice}
          </div>
        )}

        {initialLoading ? (
          <PageLoader />
        ) : (
          <KbDocumentList
            params={params}
            setParams={setParams}
            data={data}
            loading={loading}
            error={error}
            onOpenCreate={openCreate}
            onOpenEdit={openEdit}
            onClickDelete={handleDelete}
            onToggleUse={handleToggleUse}
            onReindex={handleReindex}
            onRefresh={refetch}
            backgroundPolling={hasActiveJobs}
          />
        )}
        
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
        />

        {editorOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-xl w-[860px] max-h-[90vh] overflow-y-auto p-4">
              {detailLoading ? (
                <div className="py-10 text-center text-sm text-gray-500">
                  로딩 중...
                </div>
              ) : (
                <KbDocumentEditorForm
                  value={editing}
                  onSubmit={(body, file) => handleSubmit(body, file)}
                  onCancel={closeEditor}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
