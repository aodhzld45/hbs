import React, { useEffect, useState } from 'react';
import { fetchRoleGroups, fetchUserRoles, updateUserRole } from '../../../services/Admin/roleApi';
import { RoleGroup, UserRoleAssign  } from '../../../types/Admin/RoleGroup';


const UserRoleAssignment: React.FC = () => {
  const [users, setUsers] = useState<UserRoleAssign[]>([]);
  const [roles, setRoles] = useState<RoleGroup[]>([]);
  const [editedRoles, setEditedRoles] = useState<Record<string, number>>({});

  // 초기 데이터 로딩
  useEffect(() => {
    const loadData = async () => {
      try {
        const [userData, roleData] = await Promise.all([
          fetchUserRoles(),
          fetchRoleGroups()
        ]);
        setUsers(userData);
        setRoles(roleData);
      } catch (err) {
        console.error('권한 사용자 데이터 로딩 실패:', err);
      }
    };
    loadData();
  }, []);

  const handleRoleChange = (adminId: string, newRoleId: number) => {
    setEditedRoles((prev) => ({
      ...prev,
      [adminId]: newRoleId
    }));
  };

  const handleSave = async (adminId: string) => {
    const roleId = editedRoles[adminId];
    if (!roleId) return;
  
    try {
      await updateUserRole(adminId, roleId);
      alert('권한이 변경되었습니다.');
  
      // 상태 동기화
      setEditedRoles((prev) => {
        const copy = { ...prev };
        delete copy[adminId];
        return copy;
      });
  
      setUsers((prev) =>
        prev.map((user) =>
          user.adminId === adminId
            ? {
                ...user,
                roleId: roleId,
                roleName: roles.find((r) => r.id === roleId)?.name || ''
              }
            : user
        )
      );
    } catch (err) {
      console.error('권한 저장 실패:', err);
      alert('저장 실패');
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">사용자 권한 지정</h3>
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">아이디</th>
            <th className="p-2 border">이름</th>
            <th className="p-2 border">이메일</th>
            <th className="p-2 border">권한 그룹</th>
            <th className="p-2 border">저장</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const currentRoleId = editedRoles[user.adminId] ?? user.roleId;
            return (
              <tr key={user.adminId}>
                <td className="p-2 border">{user.adminId}</td>
                <td className="p-2 border">{user.adminName}</td>
                <td className="p-2 border">{user.email}</td>
                <td className="p-2 border">
                  <select
                    value={currentRoleId}
                    onChange={(e) => handleRoleChange(user.adminId, Number(e.target.value))}
                    className="border rounded p-1 w-full"
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2 border text-center">
                  <button
                    onClick={() => handleSave(user.adminId)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    disabled={!editedRoles[user.adminId]}
                  >
                    저장
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserRoleAssignment;
