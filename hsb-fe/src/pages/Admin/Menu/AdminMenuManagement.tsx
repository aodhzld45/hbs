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
import AdminMenuModal from '../../../components/Admin/Menu/AdminMenuModal';

import { flattenMenuTree } from '../../../utils/menuTreeFlattener';
import { buildMenuTree } from '../../../utils/buildMenuTree';

const AdminMenuManagement: React.FC = () => {
  const [menus, setMenus] = useState<(AdminMenu & { label?: string })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  //생성/수정을 하나의 상태로 통합
  const [selectedMenu, setSelectedMenu] = useState<AdminMenu | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

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

  useEffect(() => {
    loadMenus();
  }, []);

  // 메뉴 순서 변경
  const moveMenu = async (currentMenu: AdminMenu, direction: 'up' | 'down') => {
    const siblingMenus = menus
      .filter(
        m => m.parentId === currentMenu.parentId && m.depth === currentMenu.depth
      )
      .sort((a, b) => (a.orderSequence ?? 0) - (b.orderSequence ?? 0));

    const groupIndex = siblingMenus.findIndex(m => m.id === currentMenu.id);

    if (
      (direction === 'up' && groupIndex === 0) ||
      (direction === 'down' && groupIndex === siblingMenus.length - 1)
    ) {
      return; // 이동 불가
    }

    const targetIndex = direction === 'up' ? groupIndex - 1 : groupIndex + 1;
    const target = siblingMenus[targetIndex];

    if (!target) return;

    // orderSequence swap
    const updatedMenus = [...menus];

    const i1 = updatedMenus.findIndex(m => m.id === currentMenu.id);
    const i2 = updatedMenus.findIndex(m => m.id === target.id);

    const tempOrder = updatedMenus[i1].orderSequence;
    updatedMenus[i1].orderSequence = updatedMenus[i2].orderSequence;
    updatedMenus[i2].orderSequence = tempOrder;

    try {
      setLoading(true);
      await updateOrderSequence(updatedMenus[i1].id!, updatedMenus[i1].orderSequence!);
      await updateOrderSequence(updatedMenus[i2].id!, updatedMenus[i2].orderSequence!);

      await loadMenus();
    } catch (error) {
      console.error('순서 변경 실패:', error);
      alert('순서 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 생성 + 수정 통합 저장 핸들러
  const handleSaveMenu = async (menu: AdminMenu) => {
    try {
      if (!menu.id || menu.id === 0) {
        // 신규 등록
        await createAdminMenu(menu);
      } else {
        // 수정
        await updateAdminMenu(menu.id as number, menu);
      }
      await loadMenus();
      setShowModal(false);
      setSelectedMenu(null);
    } catch (err) {
      console.error(err);
      setError(menu.id ? '메뉴 수정에 실패했습니다.' : '메뉴 등록에 실패했습니다.');
    }
  };

  const handleDeleteMenu = async (id?: number) => {
    if (!id) return;
    if (!window.confirm("삭제하시겠습니까?")) return;
    try {
      await deleteAdminMenu(id);
      await loadMenus();
    } catch (err) {
      console.error(err);
      setError('메뉴 삭제에 실패했습니다.');
    }
  };

  const handleToggleUseTf = async (menu: AdminMenu) => {
    try {
      const newUseTf = menu.useTf === 'Y' ? 'N' : 'Y';

      await updateAdminMenu(menu.id!, {
        ...menu,
        useTf: newUseTf,
      });

      await loadMenus();
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
            onClick={() => {
              // 신규 등록 모드: 선택 메뉴 초기화 후 모달 오픈
              setSelectedMenu(null);
              setShowModal(true);
            }}
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
              {menus.map((menu) => {
                const siblingMenus = menus
                  .filter(
                    m => m.parentId === menu.parentId && m.depth === menu.depth
                  )
                  .sort((a, b) => (a.orderSequence ?? 0) - (b.orderSequence ?? 0));

                const groupIndex = siblingMenus.findIndex(m => m.id === menu.id);

                const isFirst = groupIndex === 0;
                const isLast = groupIndex === siblingMenus.length - 1;

                return (
                  <tr key={menu.id}>
                    <td className="px-4 py-2 text-sm">{menu.id}</td>
                    <td className="px-4 py-2 text-sm whitespace-nowrap">{menu.label ?? menu.name}</td>
                    <td className="px-4 py-2 text-sm">{menu.url}</td>
                    <td className="px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          disabled={isFirst}
                          onClick={() => moveMenu(menu, 'up')}
                          className={`text-gray-600 hover:text-blue-600 ${isFirst ? 'opacity-30 cursor-not-allowed' : ''}`}
                          title="위로 이동"
                        >
                          ▲
                        </button>
                        <span>{menu.orderSequence}</span>
                        <button
                          disabled={isLast}
                          onClick={() => moveMenu(menu, 'down')}
                          className={`text-gray-600 hover:text-blue-600 ${isLast ? 'opacity-30 cursor-not-allowed' : ''}`}
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
                        onClick={() => {
                          // 수정 모드: 해당 메뉴를 선택 후 모달 오픈
                          setSelectedMenu(menu);
                          setShowModal(true);
                        }}
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
                );
              })}
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
      {/*  통합 모달: menu 없으면 신규, 있으면 수정 */}
      {showModal && (
        <AdminMenuModal
          menu={selectedMenu ?? undefined}
          onSave={handleSaveMenu}
          onCancel={() => {
            setShowModal(false);
            setSelectedMenu(null);
          }}
        />
      )}
    </AdminLayout>
  );
};

export default AdminMenuManagement;
