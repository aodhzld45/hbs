import React from 'react';
import AdminLayout from '../../../components/Layout/AdminLayout';
import Pagination from '../../../components/Common/Pagination';
import { useAdminPageHeader } from '../Common/hooks/useAdminPageHeader';
import BlockIpFormModal from './components/BlockIpFormModal';
import BlockIpTable from './components/BlockIpTable';
import { useBlockIpList, useBlockIpMutations } from './hooks/useBlockIp';
import { BlockIp, BlockIpRequest } from './types/BlockIp';

export default function BlockIpPage() {
  const { currentMenuTitle, actorId, menuError } = useAdminPageHeader();

  const {
    keyword,
    setKeyword,
    page,
    setPage,
    data,
    loading,
    refresh,
    applyFilters,
  } = useBlockIpList({ page: 0, size: 20, sort: 'regDate,desc', keyword: '' });

  const { create, update, toggleUse, removeSoft } = useBlockIpMutations(actorId);

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<BlockIp | null>(null);

  const handleSearch = () => {
    applyFilters({ keyword: keyword.trim() });
  };

  const handleCreate = async (req: BlockIpRequest) => {
    try {
      await create(req);
      setOpen(false);
      await refresh();
    } catch (e) {
      alert('Block IP 등록에 실패했습니다.');
    }
  };

  const handleUpdate = async (req: BlockIpRequest) => {
    if (!editing) return;
    try {
      await update(editing.id, req);
      setOpen(false);
      await refresh();
    } catch (e) {
      alert('Block IP 수정에 실패했습니다.');
    }
  };

  const onClickNew = () => {
    setEditing(null);
    setOpen(true);
  };

  const onClickEdit = (row: BlockIp) => {
    setEditing(row);
    setOpen(true);
  };

  const onToggleUse = async (row: BlockIp) => {
    if (!window.confirm(`[${row.ipAddress}] 사용여부를 변경할까요?`)) return;
    try {
      await toggleUse(row);
      await refresh();
    } catch (e) {
      alert('사용여부 변경에 실패했습니다.');
    }
  };

  const onDelete = async (row: BlockIp) => {
    if (!window.confirm(`[${row.ipAddress}] 를 삭제 처리할까요?`)) return;
    try {
      await removeSoft(row.id);
      await refresh();
    } catch (e) {
      alert('삭제 처리에 실패했습니다.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="text-xl font-semibold">{currentMenuTitle ?? 'Block IP 관리'}</div>
        {menuError && (
          <div className="px-4 py-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded">
            {menuError}
          </div>
        )}

        <div className="bg-gray-50 p-3 rounded-lg flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="text-sm text-gray-500 shrink-0">총 {data?.totalCount ?? 0}건</span>

          <div className="flex-1">
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="키워드 (IP/설명)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div className="shrink-0 flex gap-2">
            <button className="px-3 py-2 rounded border" onClick={handleSearch}>
              검색
            </button>
            <button className="px-3 py-2 rounded bg-gray-900 text-white" onClick={onClickNew}>
              등록
            </button>
          </div>
        </div>

        <BlockIpTable
          data={data}
          loading={loading}
          onEdit={onClickEdit}
          onToggleUse={onToggleUse}
          onDelete={onDelete}
        />

        <Pagination currentPage={page} totalPages={data?.totalPages ?? 0} onPageChange={setPage} />

        <BlockIpFormModal open={open} onClose={() => setOpen(false)} editing={editing} onSubmit={editing ? handleUpdate : handleCreate} />
      </div>
    </AdminLayout>
  );
}
