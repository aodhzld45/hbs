import { useState } from "react";
import AdminLayout from "../../../../components/Layout/AdminLayout";
import Pagination from "../../../../components/Common/Pagination";

import { useAdminPageHeader } from "../../Common/hooks/useAdminPageHeader";

import KbDocumentList from "./components/KbDocumentList";
import KbDocumentEditorForm from "./components/KbDocumentEditorForm";

import { useKbDocumentList } from "./hooks/useKbDocumentList";

import type {
  KbDocumentRequest,
  KbDocumentResponse,
} from "./types/KbDocumentConfig";

import {
  createKbDocument,
  fetchKbDocumentDetail,
  updateKbDocument,
  toggleKbDocumentUseTf,
  deleteKbDocumentSoft,
} from "./services/KbDocumentApi";

export default function AdminKbDocument() {
  /* 공통 헤더/메뉴 처리 */
  const { currentMenuTitle, actorId, menuError } = useAdminPageHeader();

  /* 목록 훅 */
  const { params, setParams, data, loading, error, refetch } = useKbDocumentList({
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

  /**
   * 파일 업로드를 위한 상태
   * - 신규/수정에서 선택한 파일을 index에서 관리하면
   *   EditorForm은 "file 선택 콜백"만 호출하도록 분리도 가능
   * - 여기서는 "EditorForm이 file을 submit과 함께 넘긴다" 전제로 처리
   */
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const openCreate = () => {
    setEditing(null);
    setUploadFile(null);
    setEditorOpen(true);
  };

  const openEdit = async (row: KbDocumentResponse) => {
    try {
      setDetailLoading(true);
      const detail = await fetchKbDocumentDetail(row.id);
      setEditing(detail);
      setUploadFile(null);
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
    setUploadFile(null);
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

        const detail = await fetchKbDocumentDetail(editing.id);
        setEditing(detail);
        refetch();

        alert("문서가 수정되었습니다. 인덱싱 상태를 확인합니다.");
        return;
      }  

      const created = await createKbDocument(req, String(actorId), file ?? null); // id 반환
      const detail = await fetchKbDocumentDetail(created.id);
      setEditing(detail);
      refetch(); // 목록 갱신
      alert("문서가 등록되었습니다. 인덱싱을 시작합니다.");
      
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "문서 저장 중 오류가 발생했습니다.");
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
        />

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
