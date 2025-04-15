// src/pages/Admin/AdminAccountManagement.tsx
import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout/Layout';
import { Admin } from '../../types/Admin/Admin';
import { fetchAdminAccounts } from '../../services/Admin/adminApi';

const AdminAccountManagement: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
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

    loadAdmins();
  }, []);

  if (loading) return <div className="text-center py-8">로딩 중...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">관리자 계정 관리</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">이름</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">이메일</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">등록일</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">액션</th>
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
                    <button className="text-blue-500 hover:underline mr-2">
                      수정
                    </button>
                    <button className="text-red-500 hover:underline">
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
    </Layout>
  );
};

export default AdminAccountManagement;
