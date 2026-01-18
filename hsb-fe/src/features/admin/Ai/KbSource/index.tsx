import React, { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../../../components/Layout/AdminLayout";
import Pagination from "../../../../components/Common/Pagination"; 

import { useAdminPageHeader } from "../../Common/hooks/useAdminPageHeader";
import { useSiteKeyOptions } from "../../Common/hooks/useSiteKeyOptions";

import KbSourceList from "./components/KbSourceList";
import { useKbSourceList } from "./hooks/useKbSourceList";
import { KbSourceRequest, KbSourceResponse } from "./types/kbSourceConfig";
import KbSourceEditorForm from "./components/KbSourceEditorForm";


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

  const openCreate = () => { setEditing(null); setEditorOpen(true); };
  const openEdit = (row: KbSourceResponse) => { setEditing(row); setEditorOpen(true); };
  const closeEditor = () => { setEditorOpen(false); setEditing(null); };

  const handleSubmit = async (req: KbSourceRequest) => {
    // if (editing) await updateKbSource(editing.id, req, actorId);
    // else await createKbSource(req, actorId);
    // closeEditor();
    // setParams(p => ({...p, page: 0}));
    // refetch();
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
              <KbSourceEditorForm
                value={editing}
                siteKeyOptions={siteKeyOptions}
                onSubmit={handleSubmit}
                onCancel={closeEditor}
              />
            </div>
          </div>
        )}

        </div>
    </AdminLayout>
  )
}

