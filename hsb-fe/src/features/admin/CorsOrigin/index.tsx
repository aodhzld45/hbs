// index.tsx
import React from 'react';
import CorsOriginTable from './components/CorsOriginTable';
import CorsOriginFormModal from './components/CorsOriginFormModal';
import type { CorsOrigin, CorsOriginRequest } from './types/CorsOrigin';
import { useCorsOriginList, useCorsOriginDetail, useCorsOriginMutations } from './hooks/useCorsOrigin';
import Pagination from "../../../components/Common/Pagination"; // 경로 확인

// 공통 메뉴 목록 불러오기
import { fetchAdminMenus } from '../../../services/Admin/adminMenuApi';
import type { AdminMenu } from '../../../types/Admin/AdminMenu';
import { useLocation } from "react-router-dom";

// 관리자 정보 불러오기
import AdminLayout from "../../../components/Layout/AdminLayout";
import { useAuth } from "../../../context/AuthContext";

export default function CorsOriginPage() {
  /** ── 공통 헤더/메뉴 처리 ───────────────────────────────────────────── */
  const location = useLocation();
  const { admin } = useAuth();
  const actorId = String(admin?.id ?? admin?.email ?? 'system');

  const [menus, setMenus] = React.useState<(AdminMenu & { label?: string })[]>([]);
  const [currentMenuTitle, setCurrentMenuTitle] = React.useState<string | null>(null);
  const [menuLoading, setMenuLoading] = React.useState(true);
  const [menuError, setMenuError] = React.useState<string>("");

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

  React.useEffect(() => {
    void loadMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  /** ── 목록 훅 (검색/필터/페이징/정렬 + 데이터 + 상태) ─────────────── */
  const {
    // 검색/필터/페이징/정렬
    keyword, setKeyword,
    tenantId, setTenantId,
    page, setPage,
    size, setSize,
    sort, setSort,

    // 데이터/상태
    data, list, loading, error,

    // 액션
    refresh,
    applyFilters,
  } = useCorsOriginList({ page: 0, size: 20, sort: 'regDate,desc', keyword: '' });

  /** ── 상세 훅 (선택된 경우만 필요) ─────────────────────────────────── */
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  
  const detail = useCorsOriginDetail(selectedId ?? undefined);

  /** ── 변경 훅 (생성/수정/토글/삭제) ───────────────────────────────── */
  const {
    create,
    update,
    toggleUse,
    removeSoft,
    loading: mutLoading,
    error: mutError,
  } = useCorsOriginMutations(actorId);

  /** ── 모달/편집 상태 ─────────────────────────────────────────────── */
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CorsOrigin | null>(null);

  /** ── 검색 실행 ──────────────────────────────────────────────────── */
  const handleSearch = () => {
    applyFilters({
      keyword: keyword.trim(),
      tenantId: tenantId.trim() || '',
    });
    // applyFilters가 page=0으로 리셋 → useEffect로 자동 refresh
  };

  /** ── 생성/수정 제출 ─────────────────────────────────────────────── */
  const handleCreate = async (req: CorsOriginRequest) => {
    await create(req);
    setOpen(false);
    await refresh();
  };

  const handleUpdate = async (req: CorsOriginRequest) => {
    if (!editing) return;
    await update(editing.id, req);
    setOpen(false);
    await refresh();
  };

  /** ── 테이블 이벤트 ──────────────────────────────────────────────── */
  const onClickNew = () => { setEditing(null); setOpen(true); };
  const onClickEdit = (row: CorsOrigin) => { setEditing(row); setOpen(true); };

  const onToggleUse = async (row: CorsOrigin) => {
    if (!window.confirm(`[${row.originPat}] 사용여부를 변경할까요?`)) return;
    await toggleUse(row);
    await refresh();
  };

  const onDelete = async (row: CorsOrigin) => {
    if (!window.confirm(`[${row.originPat}] 을(를) 삭제 처리할까요?`)) return;
    await removeSoft(row.id);
    await refresh();
  };

  /** ── 렌더 ──────────────────────────────────────────────────────── */
  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="text-xl font-semibold">CORS Origin 관리</div>

        {/* 검색바 */}
        <div className="bg-gray-50 p-3 rounded-lg flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="text-sm text-gray-500 shrink-0">총 {data?.totalCount}건</span>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              className="border rounded px-3 py-2"
              placeholder="키워드 (origin/설명)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            {/* <select
              className="border rounded px-3 py-2"
              value={useTf}
              onChange={(e) => setUseTf(e.target.value as '' | 'Y' | 'N')}
            >
              <option value="">사용여부(전체)</option>
              <option value="Y">Y</option>
              <option value="N">N</option>
            </select> */}
            <input
              className="border rounded px-3 py-2"
              placeholder="Tenant (선택)"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div className="shrink-0 flex gap-2">
            <button className="px-3 py-2 rounded border" onClick={handleSearch}>검색</button>
            <button className="px-3 py-2 rounded bg-gray-900 text-white" onClick={onClickNew}>등록</button>
          </div>
        </div>

        {/* 테이블 */}
        <CorsOriginTable
          data={data}
          onEdit={onClickEdit}
          onToggleUse={onToggleUse}
          onDelete={onDelete}
        />

        {/* 페이지네이션 (0-base 가정) */}
        <div className="flex items-center justify-between">
          <Pagination
            currentPage={page}
            totalPages={data?.totalPages ?? 0}
            onPageChange={(p) => { setPage(p); void refresh(); }}
          />
        </div>

        {/* 모달 */}
        <CorsOriginFormModal
          open={open}
          onClose={() => setOpen(false)}
          editing={editing}
          onSubmit={editing ? handleUpdate : handleCreate}
        />

      </div>
    </AdminLayout>
  );
}
