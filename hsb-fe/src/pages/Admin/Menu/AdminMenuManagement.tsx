// src/pages/Admin/AdminMenuManagement.tsx
import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../components/Layout/AdminLayout';
import { AdminMenu } from '../../../types/Admin/AdminMenu';
import {
  fetchAdminMenus,
  createAdminMenu,
  updateAdminMenu,
  deleteAdminMenu
} from '../../../services/Admin/adminMenuApi';
import AdminMenuCreateModal from '../../../components/Admin/Menu/AdminMenuCreateModal';
import AdminMenuEditModal from '../../../components/Admin/Menu/AdminMenuEditModal';
import { flattenMenuTree, FlattenedMenuOption } from '../../../utils/menuTreeFlattener';
import { buildMenuTree } from '../../../utils/buildMenuTree';

const AdminMenuManagement: React.FC = () => {
  const [menus, setMenus] = useState<(AdminMenu & { label?: string })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [editingMenu, setEditingMenu] = useState<AdminMenu | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  useEffect(() => {
    const loadMenus = async () => {
      try {
        const data = await fetchAdminMenus();

        const tree = buildMenuTree(data);
        const flattened = flattenMenuTree(tree as { id: number; name: string; children?: any[] }[]);

        const menuMap = new Map(data.map(menu => [menu.id, menu]));
        const merged = flattened.map(f => ({
          ...menuMap.get(f.id),
          label: f.label
        }));

        setMenus(merged as (AdminMenu & { label?: string })[]);
      } catch (err) {
        console.error(err);
        setError('메뉴 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    loadMenus();
  }, []);

  const handleSaveNewMenu = async (newMenu: AdminMenu) => {
    try {
      const created = await createAdminMenu(newMenu);
      setMenus(prev => [...prev, created]); // reloadMenus로 대체하는 것도 고려 가능
      setShowCreateModal(false);
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

  const handleUpdateMenu = async (updatedMenu: AdminMenu) => {
    try {
      const result = await updateAdminMenu(updatedMenu.id as number, updatedMenu);
      setMenus(prev => prev.map(menu => (menu.id === result.id ? result : menu)));
      setEditingMenu(null);
    } catch (err) {
      console.error(err);
      setError('메뉴 수정에 실패했습니다.');
    }
  };

  if (loading) return <div className="text-center py-8">로딩 중...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold mb-6">관리자 메뉴 관리</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            메뉴 등록
          </button>
        </div>

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
                  <td className="px-4 py-2 text-sm whitespace-nowrap">{menu.label ?? menu.name}</td>
                  <td className="px-4 py-2 text-sm">{menu.url}</td>
                  <td className="px-4 py-2 text-sm">{menu.orderSequence}</td>
                  <td className="px-4 py-2 text-sm">{menu.depth}</td>
                  <td className="px-4 py-2 text-sm">{menu.parentId ?? '-'}</td>
                  <td className="px-4 py-2 text-sm">
                    {menu.useTf === 'Y' ? '사용' : '미사용'} / {menu.delTf === 'N' ? '정상' : '삭제'}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <button
                      onClick={() => setEditingMenu(menu)}
                      className="text-blue-500 hover:underline mr-2"
                    >
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

      {showCreateModal && (
        <AdminMenuCreateModal
          onSave={handleSaveNewMenu}
          onCancel={() => setShowCreateModal(false)}
        />
      )}

      {editingMenu && (
        <AdminMenuEditModal
          menu={editingMenu}
          onSave={handleUpdateMenu}
          onCancel={() => setEditingMenu(null)}
        />
      )}
    </AdminLayout>
  );
};

export default AdminMenuManagement;
