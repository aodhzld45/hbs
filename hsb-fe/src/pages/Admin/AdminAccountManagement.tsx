// src/pages/Admin/AdminAccountManagement.tsx
import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';  
import { Admin } from '../../types/Admin/Admin';
import { useAuth } from '../../context/AuthContext';

import { RoleGroup } from '../../types/Admin/RoleGroup'
import { fetchAdminAccounts, registerAdmin, updateAdmin, deleteAdmin  } from '../../services/Admin/adminApi';

import { fetchRoleGroups } from '../../services/Admin/roleApi';

import AdminAccountCreateModal from '../../components/Admin/Account/AdminAccountCreateModal';

const AdminAccountManagement: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const { admin } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);

  const [error, setError] = useState<string>('');
  
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [roles, setRoles] = useState<RoleGroup[]>([]);


  const loadAdmins = async () => {
    try {
      const data = await fetchAdminAccounts();
      setAdmins(data);
    } catch (err) {
      console.error(err);
      setError('관리자 계정 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const data = await fetchRoleGroups(); // 권한 그룹 목록 조회
      setRoles(data);
    } catch (err) {
      console.error(err);
      setError('권한 그룹 목록을 불러오는 데 실패했습니다.');
    }
  };

  useEffect(() => {
    loadAdmins();
    loadRoles();
  }, []);

    const adminId = admin?.id;

  if (!adminId) {
    alert('관리자 정보가 없습니다. 다시 로그인 해주세요.');
    return null;
  }

  const handleSaveNewAdmin = async (newAdmin: Admin) => {
    try {
      const created = await registerAdmin(newAdmin, adminId);
      setAdmins(prev => [...prev, created]);
      alert('관리자가 성공적으로 등록되었습니다.');
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
      alert(err);
      throw err;                           // 실패를 호출자(모달)로 전파 → 모달 안 닫힘
      //setError('관리자 등록에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleUpdateAdmin = async (updatedAdmin: Admin) => {
    try {
      const saved = await updateAdmin(updatedAdmin, adminId);
      setAdmins(prev =>
        prev.map(a => (a.id === saved.id ? saved : a))
      );
      alert('관리자가 성공적으로 수정되었습니다.');
      setEditingAdmin(null);
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
      setError('관리자 수정에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleDelete = async (id :string ) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    try {
      await deleteAdmin(id);
      alert('관리자가 삭제되었습니다.');
      loadAdmins();
    } catch (error) {
      console.error();
      alert("관리자 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  }

  if (loading) return <div className="text-center py-8">로딩 중...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-6">관리자 계정 관리</h1>
          <button
              onClick={() => {
                setEditingAdmin(null);
                setShowCreateModal(true);
              }}            
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            관리자 계정 등록
          </button>
          </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">이름</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">이메일</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">등록일</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">관리</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{admin.id}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{admin.name || '-'}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{admin.email || '-'}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {admin.createdAt ? new Date(admin.createdAt).toLocaleString() : '-'}
                  </td>
                  <td className="px-4 py-2 text-sm">
                  <button
                      onClick={() => {
                        setEditingAdmin(admin);
                        setShowCreateModal(true);
                      }}
                      className="text-blue-500 hover:underline mr-2"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(admin.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-2 text-center text-gray-500">
                    등록된 관리자 계정이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <AdminAccountCreateModal
          onSave={editingAdmin ? handleUpdateAdmin : handleSaveNewAdmin}
          onCancel={() => setShowCreateModal(false)}
          initialData={editingAdmin}
          roleGroups={roles}
        />
      )}

    </AdminLayout>
  );
};

export default AdminAccountManagement;
