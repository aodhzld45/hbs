import React, { useMemo, useState, useEffect } from 'react';
import Toolbar from './components/Toolbar';
import ListTable from './components/ListTable';
import EditorForm from './components/EditorForm';
import PreviewPanel from './components/PreviewPanel';
import Pagination from "../../../../components/Common/Pagination"; // ← 공통 컴포넌트 경로에 맞게 조정

import { fetchWidgetConfigCreateWithFile, fetchWidgetConfigUpdateWithFile, fetchWidgetConfigCreate, fetchWidgetConfigUpdate, updateWidgetConfigUseTf, fetchWidgetConfigDelete } from "./services/widgetConfigApi";

// 공통 메뉴 목록 불러오기
import {
  fetchAdminMenus
} from '../../../../services/Admin/adminMenuApi';
import { AdminMenu } from '../../../../types/Admin/AdminMenu';
import { useLocation } from "react-router-dom";

// 관리자 정보 불러오기
import AdminLayout from "../../../../components/Layout/AdminLayout";
import { useAuth } from "../../../../context/AuthContext";
import { useWidgetConfigDetail, useWidgetConfigList, useWidgetConfigMutations } from './hooks/useWidgetConfig';
import type { WidgetConfigRequest } from './types/widgetConfig';

export default function AdminWidgetConfig() {
    const [selectedId, setSelectedId] = useState<number | null>(null);
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
  

  // 목록 훅
  const list = useWidgetConfigList({ page: 0, size: 20, sort: 'regDate,desc', keyword: '' });

  // 상세 훅 (선택된 경우만)
  const detail = useWidgetConfigDetail(selectedId ?? undefined);

  const openCreate = () => setSelectedId(0);
  const openEdit = (id: number) => setSelectedId(id);
  const closeEditor = () => setSelectedId(null);

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
          await fetchWidgetConfigCreate(data, actor);
        } else {
          await fetchWidgetConfigUpdate(selectedId!, data, actor);
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

  const previewData = useMemo(() => detail.data ?? (selectedId === 0 ? {} : {}), [detail.data, selectedId]);

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

          <div className="flex justify-end">
            <Pagination
              currentPage={list.page}
              totalPages={list.data?.totalPages ?? 0}
              onPageChange={(p) => { list.setPage(p); void list.refresh(); }}
            />
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="order-2 lg:order-1">
            <EditorForm value={detail.data || (selectedId === 0 ? undefined : null)} onSubmit={handleSubmit} onCancel={closeEditor} />
          </div>
          <div className="order-1 lg:order-2">
            <PreviewPanel cfg={previewData} />
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
}
