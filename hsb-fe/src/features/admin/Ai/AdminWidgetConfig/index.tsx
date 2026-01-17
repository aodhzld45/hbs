import React, { useState, useEffect } from 'react';
import Toolbar from './components/Toolbar';
import AdminLayout from "../../../../components/Layout/AdminLayout";

import ListTable from './components/ListTable';
import EditorForm from './components/EditorForm';
import PreviewPanel from './components/PreviewPanel';
import Pagination from "../../../../components/Common/Pagination";

import { useAdminPageHeader } from "../../Common/hooks/useAdminPageHeader";
import { useSearchParams } from 'react-router-dom';

import { fetchWidgetConfigCreateWithFile, fetchWidgetConfigUpdateWithFile, fetchWidgetConfigCreateMultipart, fetchWidgetConfigUpdateMultipart, updateWidgetConfigUseTf, fetchWidgetConfigDelete } from "./services/widgetConfigApi";
import { useWidgetConfigDetail, useWidgetConfigList, useWidgetConfigMutations } from './hooks/useWidgetConfig';
import type { WidgetConfigRequest } from './types/widgetConfig';

export default function AdminWidgetConfig() {
    const [searchParams, setSearchParams] = useSearchParams();

    /* 공통 헤더/메뉴 처리 */
    const { currentMenuTitle, actorId, menuError } = useAdminPageHeader();

    // URL ?editId=3 이면 3, 없으면 null
    const editIdParam = searchParams.get('editId');
    const selectedId: number | null =
      editIdParam != null ? Number(editIdParam) : null;

  // 미리보기 패널용 설정 상태  
  const [previewCfg, setPreviewCfg] = useState<Partial<WidgetConfigRequest>>({});

  // 미리보기 패널용 프롬프트 프로필 welcomeBlocksJson
  const [welcomeBlocksJson, setWelcomeBlocksJson] = useState<string | null>(null);
  
  // 목록 훅
  const list = useWidgetConfigList({ page: 0, size: 20, sort: 'regDate,desc', keyword: '' });

  // 상세 훅 (선택된 경우만)
  const detail = useWidgetConfigDetail(selectedId ?? undefined);
 
  const openCreate = () => {
    const next = new URLSearchParams(searchParams);
    next.set('editId', '0');              // 신규는 0으로 약속
    setSearchParams(next, { replace: false });
  };

  const openEdit = (id: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('editId', String(id));
    setSearchParams(next, { replace: false });
  };  

  const closeEditor = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('editId');                // 편집 모드 종료
    setSearchParams(next, { replace: true });
  };
  
  const handleSubmit = async (data: WidgetConfigRequest, iconFile?: File | null) => {
    try {
      const isCreate = !selectedId || selectedId === 0;
      const actor = actorId ?? '';

      if (iconFile) {
        // 멀티파트(FormData) 전송: form(JSON) + iconFile
        const fd = new FormData();
        fd.append('form', new Blob([JSON.stringify(data)], { type: 'application/json' }));
        fd.append('iconFile', iconFile);

        if (isCreate) {
          await fetchWidgetConfigCreateWithFile(data, actor, iconFile);
        } else {
          await fetchWidgetConfigUpdateWithFile(selectedId!, data, actor, iconFile);
        }
      } else {
        // 기존 JSON 경로 유지
        if (isCreate) {
          await fetchWidgetConfigCreateMultipart(data, actor);
        } else {
          await fetchWidgetConfigUpdateMultipart(selectedId!, data, actor);
        }
      }

      closeEditor();
      await list.refresh();
    } catch (e: any) {
      console.error('[WidgetConfig] 저장 실패:', e);
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        '저장에 실패했습니다. 잠시 후 다시 시도해 주세요.';
      alert(msg);
    }
  };

  // 상세가 로드되면 미리보기 초기화
  useEffect(() => {
    if (detail.data) {
      const { id, useTf, delTf, regDate, upDate, ...rest } = detail.data;
      setPreviewCfg({ ...rest });

      // 편집 진입 시 기본 초기화 (EditorForm에서 다시 채워줌)
      setWelcomeBlocksJson(null);

    } else if (selectedId === 0) {
      // 신규 기본값
      setPreviewCfg({
        name: '',
        position: 'right',
        offsetX: 20,
        offsetY: 20,
        panelWidthPx: 360,
        zIndex: 2147483000,
        openOnLoad: 'N',
        greetOncePerOpen: 'Y',
        closeOnEsc: 'Y',
        closeOnOutsideClick: 'Y',
        linkedSiteKeyId: null,
      }); 
      setWelcomeBlocksJson(null);
    }
  }, [detail.data, selectedId]);

  return (
  <AdminLayout>
    <div className="p-5 space-y-4">
    <h2 className="text-2xl font-bold mb-4">{currentMenuTitle}</h2>

      {menuError && (
        <div className="px-4 py-2 mb-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded">
          {menuError}
        </div>
      )}

      {selectedId === null ? (
        <>
          <Toolbar
            keyword={list.keyword}
            onKeywordChange={list.setKeyword}
            onSearch={list.refresh}
            size={list.size}
            onSizeChange={list.setSize}
            onCreate={openCreate}
          />

          <ListTable
            data={list.data}
            loading={list.loading}
            onEdit={openEdit}
            onToggleUse={async (id, next) => { await updateWidgetConfigUseTf(id, next, actorId ?? ""); await list.refresh(); }}
            onDelete={async (id) => { await fetchWidgetConfigDelete(id, actorId ?? ""); await list.refresh(); }}
          />

          <Pagination
            currentPage={list.page}
            totalPages={list.data?.totalPages ?? 0}
            onPageChange={(p) => { list.setPage(p); void list.refresh(); }}
          />
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="order-2 lg:order-1">
            <EditorForm 
              value={detail.data || (selectedId === 0 ? undefined : null)}
              onSubmit={handleSubmit}
              onCancel={closeEditor}
              onChangePreview={setPreviewCfg}
              onWelcomeBlocksJsonChange={setWelcomeBlocksJson}
            />
          </div>
          <div className="order-1 lg:order-2">
            <PreviewPanel 
              cfg={previewCfg}
              welcomeBlocksJson={welcomeBlocksJson}
            />
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
}
