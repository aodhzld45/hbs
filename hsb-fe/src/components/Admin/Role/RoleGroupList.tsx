import React, { useState, useMemo } from 'react';
import { RoleGroup } from '../../../types/Admin/RoleGroup';
import RoleGroupModal from './RoleGroupModal';
import ConfirmModal from './ConfirmModal';
import {
  createRoleGroup,
  updateRoleGroup,
  softDeleteRoleGroup,
} from '../../../services/Admin/roleApi';
import { ToastType } from './Toast';

type SortKey = 'id' | 'name' | 'useTf';
type SortOrder = 'asc' | 'desc';

interface RoleGroupListProps {
  roles: RoleGroup[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  showToast: (message: string, type?: ToastType) => void;
}

const RoleGroupList: React.FC<RoleGroupListProps> = ({
  roles,
  loading,
  onRefresh,
  showToast,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleGroup | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; roleId: number | null }>({
    open: false,
    roleId: null,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [useTfFilter, setUseTfFilter] = useState<'all' | 'Y' | 'N'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [saving, setSaving] = useState(false);

  const filteredAndSortedRoles = useMemo(() => {
    let list = roles.filter((r) => {
      const matchSearch =
        !searchQuery.trim() ||
        r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchUseTf =
        useTfFilter === 'all' || r.useTf === useTfFilter;
      return matchSearch && matchUseTf;
    });
    list = [...list].sort((a, b) => {
      let aVal: number | string = a[sortKey] ?? '';
      let bVal: number | string = b[sortKey] ?? '';
      if (sortKey === 'useTf') {
        aVal = aVal === 'Y' ? 1 : 0;
        bVal = bVal === 'Y' ? 1 : 0;
      }
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [roles, searchQuery, useTfFilter, sortKey, sortOrder]);

  const openCreateModal = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const openEditModal = (role: RoleGroup) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: RoleGroup) => {
    setSaving(true);
    try {
      if (data.id) {
        await updateRoleGroup(data.id, {
          name: data.name,
          description: data.description,
          useTf: data.useTf,
        });
        showToast('권한 그룹이 수정되었습니다.', 'success');
      } else {
        await createRoleGroup({
          name: data.name,
          description: data.description,
          useTf: data.useTf,
        });
        showToast('권한 그룹이 등록되었습니다.', 'success');
      }
      await onRefresh();
      setIsModalOpen(false);
    } catch (err) {
      console.error('권한 그룹 저장 실패:', err);
      showToast('저장에 실패했습니다.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteConfirm({ open: true, roleId: id });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.roleId == null) return;
    setSaving(true);
    try {
      await softDeleteRoleGroup(deleteConfirm.roleId);
      showToast('삭제되었습니다.', 'success');
      await onRefresh();
      setDeleteConfirm({ open: false, roleId: null });
      setIsModalOpen(false);
    } catch (err) {
      console.error('삭제 실패:', err);
      showToast('삭제에 실패했습니다.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else setSortKey(key);
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold">권한 그룹 목록</h3>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="검색 (이름, 설명)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-3 py-1.5 rounded text-sm w-48"
          />
          <select
            value={useTfFilter}
            onChange={(e) => setUseTfFilter(e.target.value as 'all' | 'Y' | 'N')}
            className="border px-3 py-1.5 rounded text-sm"
          >
            <option value="all">사용여부 전체</option>
            <option value="Y">사용</option>
            <option value="N">미사용</option>
          </select>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            + 새 그룹 등록
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-500">로딩 중...</div>
      ) : (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th
                className="p-2 border cursor-pointer hover:bg-gray-200"
                onClick={() => toggleSort('id')}
              >
                ID {sortKey === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="p-2 border cursor-pointer hover:bg-gray-200"
                onClick={() => toggleSort('name')}
              >
                이름 {sortKey === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="p-2 border">설명</th>
              <th
                className="p-2 border cursor-pointer hover:bg-gray-200"
                onClick={() => toggleSort('useTf')}
              >
                사용여부 {sortKey === 'useTf' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="p-2 border">관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedRoles.map((role) => (
              <tr key={role.id} className="hover:bg-gray-50">
                <td className="p-2 border">{role.id}</td>
                <td className="p-2 border">{role.name}</td>
                <td className="p-2 border">{role.description ?? '-'}</td>
                <td className="p-2 border">{role.useTf === 'Y' ? '사용' : '미사용'}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => openEditModal(role)}
                    className="text-blue-600 hover:underline"
                  >
                    수정
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && filteredAndSortedRoles.length === 0 && (
        <div className="py-6 text-center text-gray-500">표시할 권한 그룹이 없습니다.</div>
      )}

      <RoleGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        onDelete={handleDeleteClick}
        initialData={editingRole}
        existingRoles={roles}
        showToast={showToast}
        saving={saving}
      />

      <ConfirmModal
        isOpen={deleteConfirm.open}
        title="권한 그룹 삭제"
        message="정말 삭제하시겠습니까?"
        confirmLabel="삭제"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm({ open: false, roleId: null })}
      />
    </div>
  );
};

export default RoleGroupList;
