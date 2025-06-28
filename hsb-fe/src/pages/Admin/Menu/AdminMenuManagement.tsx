// src/pages/Admin/AdminMenuManagement.tsx
import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../components/Layout/AdminLayout';
import { AdminMenu } from '../../../types/Admin/AdminMenu';
import {
  fetchAdminMenus,
  createAdminMenu,
  updateAdminMenu,
  updateOrderSequence,
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

    const loadMenus = async () => {
      try {
        const data = await fetchAdminMenus();
        const tree = buildMenuTree(data);

        console.log(tree);
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


  useEffect(() => {
    loadMenus();
  }, []);


  // 메뉴 순서 변경
  const moveMenu = async (index: number, direction: 'up' | 'down') => {
    const current = menus[index];
    if (!current) return;
  
    // 같은 부모 ID 가진 메뉴들만 추출 (같은 depth까지 체크)
    const siblingMenus = menus
      .filter(
        m => m.parentId === current.parentId && m.depth === current.depth
      )
      .sort((a, b) => (a.orderSequence ?? 0) - (b.orderSequence ?? 0));
  
    const groupIndex = siblingMenus.findIndex(m => m.id === current.id);
  
    if (
      (direction === 'up' && groupIndex === 0) ||
      (direction === 'down' && groupIndex === siblingMenus.length - 1)
    ) {
      return; // 이동 불가 (최상위 or 최하위)
    }
  
    const targetIndex = direction === 'up' ? groupIndex - 1 : groupIndex + 1;
    const target = siblingMenus[targetIndex];
  
    if (!target) return;
  
    // 순서 교환
    const updatedMenus = [...menus];
    
    const i1 = updatedMenus.findIndex(m => m.id === current.id);
    const i2 = updatedMenus.findIndex(m => m.id === target.id);
    
    // orderSequence swap
    const tempOrder = updatedMenus[i1].orderSequence;
    updatedMenus[i1].orderSequence = updatedMenus[i2].orderSequence;
    updatedMenus[i2].orderSequence = tempOrder;
  
    try {
      // 서버에 순서 업데이트
      await updateOrderSequence(updatedMenus[i1].id!, updatedMenus[i1].orderSequence!);
      await updateOrderSequence(updatedMenus[i2].id!, updatedMenus[i2].orderSequence!);
  
      setLoading(true);
      await loadMenus();
      setLoading(false);
    } catch (error) {
      console.error('순서 변경 실패:', error);
    }
  };
  
  
  const moveMenuUp = (index: number) => moveMenu(index, 'up');
  const moveMenuDown = (index: number) => moveMenu(index, 'down');

  const handleSaveNewMenu = async (newMenu: AdminMenu) => {
    try {
      const created = await createAdminMenu(newMenu);
      setMenus(prev => [...prev, created]); // reloadMenus로 대체하는 것도 고려 가능
      setShowCreateModal(false);

      setLoading(true);
      await loadMenus();
      setLoading(false);

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

  const handleToggleUseTf = async (menu: AdminMenu) => {
    try {
      const newUseTf = menu.useTf === 'Y' ? 'N' : 'Y';
  
      // API 호출
      await updateAdminMenu(menu.id!, {
        ...menu,
        useTf: newUseTf,
      });
  
      // 다시 메뉴 목록 새로고침
      setLoading(true);
      await loadMenus();
      setLoading(false);
    } catch (error) {
      console.error('useTf 변경 실패:', error);
      alert('상태 변경에 실패했습니다.');
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
              {menus.map((menu, index) => (
                <tr key={menu.id}>
                  <td className="px-4 py-2 text-sm">{menu.id}</td>
                  <td className="px-4 py-2 text-sm whitespace-nowrap">{menu.label ?? menu.name}</td>
                  <td className="px-4 py-2 text-sm">{menu.url}</td>
                  {/* <td className="px-4 py-2 text-sm">{menu.orderSequence}</td> */}
                  <td className="px-4 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        disabled={index === 0}
                        onClick={() => moveMenuUp(index)}
                        className="text-gray-600 hover:text-blue-600"
                        title="위로 이동"
                      >
                        ▲
                      </button>
                      <button
                        disabled={index === menus.length - 1}
                        onClick={() => moveMenuDown(index)}
                        className="text-gray-600 hover:text-blue-600"
                        title="아래로 이동"
                      >
                        ▼
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm">{menu.depth}</td>
                  <td className="px-4 py-2 text-sm">{menu.parentId ?? '-'}</td>
      
                  <td className="px-4 py-2 text-sm">
                    <button
                      onClick={() => handleToggleUseTf(menu)}
                      className={`px-2 py-1 rounded text-xs ${
                        menu.useTf === 'Y'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-600'
                      } hover:bg-green-200`}
                    >
                      {menu.useTf === 'Y' ? '사용' : '미사용'}
                    </button>
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
