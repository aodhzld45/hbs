import React, { useMemo, useState, useEffect } from 'react';
import Toolbar from './components/Toolbar';
import ListTable from './components/ListTable';
import EditorForm from './components/EditorForm';
import PreviewPanel from './components/PreviewPanel';
import Pagination from "../../../../components/Common/Pagination"; // ← 공통 컴포넌트 경로에 맞게 조정

import { fetchWidgetConfigCreateWithFile, fetchWidgetConfigUpdateWithFile, fetchWidgetConfigCreateMultipart, fetchWidgetConfigUpdateMultipart, updateWidgetConfigUseTf, fetchWidgetConfigDelete } from "./services/widgetConfigApi";
import { useWidgetConfigDetail, useWidgetConfigList, useWidgetConfigMutations } from './hooks/useWidgetConfig';
import type { WidgetConfigRequest } from './types/widgetConfig';

// 공통 메뉴 목록 불러오기
import {
  fetchAdminMenus
} from '../../../../services/Admin/adminMenuApi';
import { AdminMenu } from '../../../../types/Admin/AdminMenu';
import { useLocation, useSearchParams } from "react-router-dom";

// 관리자 정보 불러오기
import AdminLayout from "../../../../components/Layout/AdminLayout";
import { useAuth } from "../../../../context/AuthContext";

export default function AdminWidgetConfig() {
    const [searchParams, setSearchParams] = useSearchParams();

    // URL ?editId=3 이면 3, 없으면 null
    const editIdParam = searchParams.get('editId');
    const selectedId: number | null =
      editIdParam != null ? Number(editIdParam) : null;

    // 공통 헤더/메뉴 관련
    const location = useLocation();
    const { admin } = useAuth();
    const [adminId, setAdminId] = useState<string | null>(admin?.id || null);
    const [menus, setMenus] = useState<(AdminMenu & { label?: string })[]>([]);
    const [currentMenuTitle, setCurrentMenuTitle] = useState<string | null>(null);
    const [menuLoading, setMenuLoading] = useState(true);
    const [menuError, setMenuError] = useState<string>("");
    // ===== 메뉴 로딩 =====
    const loadMenus = async () => {
        try {
        const data = await fetchAdminMenus();
        setMenus(data);
        const matched = data.find((m) => m.url === location.pathname);
        setCurrentMenuTitle(matched ? matched.name : null);
        } catch (e) {
        console.error(e);
        setMenuError("메뉴 목록을 불러오는데 실패했습니다.");
        } finally {
        setMenuLoading(false);
        }
    };

    useEffect(() => {
      loadMenus();
    }, [location.pathname]);

    useEffect(() => {
      setAdminId(admin?.id || null);
    }, [admin?.id]);
  
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
      const actor = adminId ?? '';

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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">위젯 설정</h2>
      </div>

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
            onToggleUse={async (id, next) => { await updateWidgetConfigUseTf(id, next, adminId ?? ""); await list.refresh(); }}
            onDelete={async (id) => { await fetchWidgetConfigDelete(id, adminId ?? ""); await list.refresh(); }}
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
