import React, { useEffect, useState, useMemo } from 'react';
import { fetchUserRoles, updateUserRole } from '../../../services/Admin/roleApi';
import { RoleGroup, UserRoleAssign } from '../../../types/Admin/RoleGroup';
import { ToastType } from './Toast';

interface UserRoleAssignmentProps {
  roles: RoleGroup[];
  rolesLoading: boolean;
  showToast: (message: string, type?: ToastType) => void;
}

const UserRoleAssignment: React.FC<UserRoleAssignmentProps> = ({
  roles,
  rolesLoading,
  showToast,
}) => {
  const [users, setUsers] = useState<UserRoleAssign[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [editedRoles, setEditedRoles] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<number | 'all'>('all');
  const [saving, setSaving] = useState<string | 'bulk' | null>(null);

  useEffect(() => {
    let mounted = true;
    setUsersLoading(true);
    fetchUserRoles()
      .then((data) => {
        if (mounted) setUsers(data);
      })
      .catch((err) => {
        console.error('권한 사용자 데이터 로딩 실패:', err);
        if (mounted) showToast('사용자 목록을 불러오지 못했습니다.', 'error');
      })
      .finally(() => {
        if (mounted) setUsersLoading(false);
      });
    return () => { mounted = false; };
  }, [showToast]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        (user.adminId ?? '').toLowerCase().includes(q) ||
        (user.adminName ?? '').toLowerCase().includes(q) ||
        (user.email ?? '').toLowerCase().includes(q);
      const currentRoleId = editedRoles[user.adminId] ?? user.roleId;
      const matchRole = roleFilter === 'all' || currentRoleId === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, searchQuery, roleFilter, editedRoles]);

  const handleRoleChange = (adminId: string, newRoleId: number) => {
    setEditedRoles((prev) => ({ ...prev, [adminId]: newRoleId }));
  };

  const handleSaveOne = async (adminId: string) => {
    const roleId = editedRoles[adminId];
    if (roleId == null) return;

    setSaving(adminId);
    try {
      await updateUserRole(adminId, roleId);
      showToast('권한이 변경되었습니다.', 'success');
      setEditedRoles((prev) => {
        const next = { ...prev };
        delete next[adminId];
        return next;
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.adminId === adminId
            ? { ...u, roleId, roleName: roles.find((r) => r.id === roleId)?.name ?? '' }
            : u
        )
      );
    } catch (err) {
      console.error('권한 저장 실패:', err);
      showToast('저장에 실패했습니다.', 'error');
    } finally {
      setSaving(null);
    }
  };

  const bulkChangedIds = useMemo(
    () => Object.keys(editedRoles).filter((id) => editedRoles[id] != null),
    [editedRoles]
  );

  const handleBulkSave = async () => {
    if (bulkChangedIds.length === 0) {
      showToast('변경된 항목이 없습니다.', 'info');
      return;
    }

    setSaving('bulk');
    let success = 0;
    let fail = 0;
    try {
      for (const adminId of bulkChangedIds) {
        const roleId = editedRoles[adminId];
        if (roleId == null) continue;
        try {
          await updateUserRole(adminId, roleId);
          success++;
          setEditedRoles((prev) => {
            const next = { ...prev };
            delete next[adminId];
            return next;
          });
          setUsers((prev) =>
            prev.map((u) =>
              u.adminId === adminId
                ? { ...u, roleId, roleName: roles.find((r) => r.id === roleId)?.name ?? '' }
                : u
            )
          );
        } catch {
          fail++;
        }
      }
      if (fail === 0) {
        showToast(`${success}명의 권한이 변경되었습니다.`, 'success');
      } else {
        showToast(`${success}명 성공, ${fail}명 실패했습니다.`, 'error');
      }
    } finally {
      setSaving(null);
    }
  };

  const loading = rolesLoading || usersLoading;

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold">사용자 권한 지정</h3>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="검색 (아이디, 이름, 이메일)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border px-3 py-1.5 rounded text-sm w-52"
          />
          <select
            value={roleFilter === 'all' ? 'all' : roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
            className="border px-3 py-1.5 rounded text-sm"
          >
            <option value="all">권한 전체</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleBulkSave}
            disabled={bulkChangedIds.length === 0 || saving !== null}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving === 'bulk' ? '저장 중...' : `일괄 저장 (${bulkChangedIds.length})`}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-500">로딩 중...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">아이디</th>
                <th className="p-2 border">이름</th>
                <th className="p-2 border">이메일</th>
                <th className="p-2 border">권한 그룹</th>
                <th className="p-2 border w-24">저장</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const currentRoleId = editedRoles[user.adminId] ?? user.roleId;
                const role = roles.find((r) => r.id === currentRoleId);
                const isUnusedRole = role?.useTf === 'N';
                return (
                  <tr key={user.adminId} className="hover:bg-gray-50">
                    <td className="p-2 border">{user.adminId}</td>
                    <td className="p-2 border">{user.adminName}</td>
                    <td className="p-2 border">{user.email}</td>
                    <td className="p-2 border">
                      <select
                        value={currentRoleId}
                        onChange={(e) =>
                          handleRoleChange(user.adminId, Number(e.target.value))
                        }
                        className={`border rounded p-1 w-full text-sm ${isUnusedRole ? 'text-amber-600' : ''}`}
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                            {r.useTf === 'N' ? ' (미사용)' : ''}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2 border text-center">
                      <button
                        type="button"
                        onClick={() => handleSaveOne(user.adminId)}
                        disabled={editedRoles[user.adminId] == null || saving !== null}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {saving === user.adminId ? '저장 중...' : '저장'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filteredUsers.length === 0 && (
        <div className="py-6 text-center text-gray-500">표시할 사용자가 없습니다.</div>
      )}
    </div>
  );
};

export default UserRoleAssignment;
