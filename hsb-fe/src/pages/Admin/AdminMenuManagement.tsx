// src/pages/Admin/AdminMenuManagement.tsx
import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import { AdminMenu } from '../../types/Admin/AdminMenu';
import { fetchAdminMenus, createAdminMenu, deleteAdminMenu } from '../../services/Admin/adminMenuApi';

const AdminMenuManagement: React.FC = () => {
  const [menus, setMenus] = useState<AdminMenu[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [newMenu, setNewMenu] = useState<AdminMenu>({
    name: '',
    depth: 1,
    parentId: undefined,
    description: '',
    url: '',
    orderSequence: 1,
    useTf: 'Y',
    delTf: 'N',
  });

  useEffect(() => {
    const loadMenus = async () => {
      try {
        const data = await fetchAdminMenus();
        setMenus(data);
      } catch (err) {
        console.error(err);
        setError('메뉴 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    loadMenus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewMenu(prev => ({
      ...prev,
      [name]:
        name === 'orderSequence' || name === 'depth'
          ? Number(value)
          : value,
    }));
  };

  const handleCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await createAdminMenu(newMenu);
      setMenus(prev => [...prev, created]);
      setNewMenu({
        name: '',
        depth: 1,
        parentId: undefined,
        description: '',
        url: '',
        orderSequence: 1,
        useTf: 'Y',
        delTf: 'N',
      });
    } catch (err) {
      console.error(err);
      setError('메뉴 등록에 실패했습니다.');
    }
  };

  const handleDeleteMenu = async (id?: number) => {
    if (!id) return;
    try {
      await deleteAdminMenu(id);
      setMenus(prev => prev.filter(menu => menu.id !== id));
    } catch (err) {
      console.error(err);
      setError('메뉴 삭제에 실패했습니다.');
    }
  };

  if (loading) return <div className="text-center py-8">로딩 중...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">관리자 메뉴 관리</h1>
        
        {/* 신규 메뉴 등록 폼 */}
        <form onSubmit={handleCreateMenu} className="mb-8">
          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              name="name"
              placeholder="메뉴 이름"
              value={newMenu.name}
              onChange={handleInputChange}
              className="px-3 py-2 border rounded"
              required
            />
            <input
              type="text"
              name="url"
              placeholder="메뉴 URL"
              value={newMenu.url}
              onChange={handleInputChange}
              className="px-3 py-2 border rounded"
              required
            />
            <input
              type="number"
              name="orderSequence"
              placeholder="순서"
              value={newMenu.orderSequence}
              onChange={handleInputChange}
              className="px-3 py-2 border rounded"
              required
            />
            <input
              type="number"
              name="depth"
              placeholder="뎁스 (예: 1)"
              value={newMenu.depth}
              onChange={handleInputChange}
              className="px-3 py-2 border rounded"
              required
            />
            <input
              type="text"
              name="parentId"
              placeholder="부모 메뉴 ID (없으면 비워두세요)"
              value={newMenu.parentId ? newMenu.parentId.toString() : ''}
              onChange={handleInputChange}
              className="px-3 py-2 border rounded"
            />
            <textarea
              name="description"
              placeholder="메모 (옵션)"
              value={newMenu.description}
              onChange={handleInputChange}
              className="px-3 py-2 border rounded"
            ></textarea>
          </div>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            메뉴 등록
          </button>
        </form>

        {/* 메뉴 목록 테이블 */}
        <div className="overflow-x-auto">
          <table className="min-w-full border divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">메뉴명</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">URL</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">순서</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">뎁스</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">부모 ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">상태</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">액션</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {menus.map(menu => (
                <tr key={menu.id}>
                  <td className="px-4 py-2 text-sm">{menu.id}</td>
                  <td className="px-4 py-2 text-sm">{menu.name}</td>
                  <td className="px-4 py-2 text-sm">{menu.url}</td>
                  <td className="px-4 py-2 text-sm">{menu.orderSequence}</td>
                  <td className="px-4 py-2 text-sm">{menu.depth}</td>
                  <td className="px-4 py-2 text-sm">{menu.parentId ?? '-'}</td>
                  <td className="px-4 py-2 text-sm">
                    {menu.useTf === 'Y' ? '사용' : '미사용'} / {menu.delTf === 'N' ? '정상' : '삭제'}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {/* 수정 기능은 필요 시 모달이나 별도 페이지로 구현 */}
                    <button className="text-blue-500 hover:underline mr-2">
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteMenu(menu.id)}
                      className="text-red-500 hover:underline"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
              {menus.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-2 text-center text-gray-500">
                    등록된 메뉴가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMenuManagement;
