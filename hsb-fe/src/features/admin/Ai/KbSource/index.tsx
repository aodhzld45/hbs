import React, { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../../../components/Layout/AdminLayout";
import Pagination from "../../../../components/Common/Pagination"; 

import { useAdminPageHeader } from "../../Common/hooks/useAdminPageHeader";
import { useSiteKeyOptions } from "../../Common/hooks/useSiteKeyOptions";

import KbSourceList from "./components/KbSourceList";
import { useKbSourceList } from "./hooks/useKbSourceList";
import { KbSourceRequest, KbSourceResponse } from "./types/kbSourceConfig";
import KbSourceEditorForm from "./components/KbSourceEditorForm";
import { createKbSource, fetchKbSource, updateKbSource, toggleKbSourceUseTf, deleteKbSourceSoft } from "./services/kbSourceApi";


export default function AdminKbSourse() {
  /* 공통 헤더/메뉴 처리 */
  const { currentMenuTitle, actorId, menuError } = useAdminPageHeader();

  const { params, setParams, data, loading, error, refetch } = useKbSourceList({
    page: 0,
    size: 20,
    sort: "regDate,desc",
  });

  const page = params.page ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const { siteKeyOptions } = useSiteKeyOptions();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<KbSourceResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const openCreate = () => { setEditing(null); setEditorOpen(true); };

  const openEdit = async (row: KbSourceResponse) => {
    try {
      setDetailLoading(true);

      const detail = await fetchKbSource(row.id);
      setEditing(detail);
      setEditorOpen(true);
    } catch (e:any) {
      console.error(e);
      alert(e?.message ?? "지식 소스 상세 조회 실패");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeEditor = () => { setEditorOpen(false); setEditing(null); };

  const handleSubmit = async (req: KbSourceRequest) => {
    try {
      if (editing) {
        // 수정
        await updateKbSource(editing.id, req, actorId)
        alert("지식 소스가 수정되었습니다.");
      } else {
        // 신규 등록
        await createKbSource(req, actorId)
        alert("지식 소스가 등록되었습니다.")
      }
      refetch();
      closeEditor();
    } catch (e: any) {
      alert(e?.message ?? "지식 소스 저장 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async (row: KbSourceResponse) => {
    if (!window.confirm(`"${row.sourceName}"지식 소스를 삭제하시겠습니까?`)) {
      return;
    }
    try {
      await deleteKbSourceSoft(row.id, actorId);
      alert("삭제되었습니다.");
      refetch();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "삭제 중 오류가 발생했습니다.");
    }
  };

  const handleToggleUse = async (row: KbSourceResponse) => {
    const nextUse: "Y" | "N" = row.useTf === "Y" ? "N" : "Y";
    try {
      await toggleKbSourceUseTf(row.id, nextUse, actorId);
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


        <KbSourceList
          params={params}
          setParams={setParams}
          data={data}
          loading={loading}
          error={error}
          onRefetch={refetch}
          onOpenCreate={openCreate} 
          onOpenEdit={openEdit}
          onClickDelete={handleDelete}
          onToggleUse={handleToggleUse}
        />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => { 
            setParams((prev) => ({ ...prev, page: p }));
          }}
        />

        {editorOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-xl w-[720px] max-h-[90vh] overflow-y-auto p-4">
              {detailLoading ? (
                <div className="py-10 text-center text-sm text-gray-500">
                  로딩 중...
                </div>
              ) : (
                <KbSourceEditorForm
                  value={editing}
                  siteKeyOptions={siteKeyOptions}
                  onSubmit={handleSubmit}
                  onCancel={closeEditor}
                />
              )}
            </div>
          </div>
          )}
        </div>
    </AdminLayout>
  )
}

