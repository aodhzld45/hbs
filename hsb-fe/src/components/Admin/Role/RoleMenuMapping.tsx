import React, { useEffect, useState } from 'react';
import { RoleGroup, MenuPermission } from '../../../types/Admin/RoleGroup';
import {
  fetchRoleGroups,
  fetchMenus,
  fetchRoleMenus,
  saveRoleMenus,
} from '../../../services/Admin/roleApi';

interface AdminMenu {
  id: number;
  name: string;
}

const RoleMenuMapping: React.FC = () => {
  const [roles, setRoles] = useState<RoleGroup[]>([]);
  const [menus, setMenus] = useState<AdminMenu[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [menuPermissions, setMenuPermissions] = useState<MenuPermission[]>([]);

  // 1. 권한 그룹 + 전체 메뉴 로딩
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [rolesRes, menusRes] = await Promise.all([
          fetchRoleGroups(),
          fetchMenus(),
        ]);
        
        setRoles(rolesRes);
        setMenus(menusRes);
      } catch (error) {
        console.error('초기 데이터 로딩 실패:', error);
      }
    };

    loadInitialData();
  }, []);

  // 2. 권한 그룹 선택 시 해당 권한의 메뉴 목록 조회
  useEffect(() => {
    if (selectedRoleId !== null && menus.length > 0) {
      fetchRoleMenus(selectedRoleId).then((res) => {
        const existingPermissions = res.menuPermissions || [];
  
        const initializedPermissions: MenuPermission[] = menus.map((menu) => {
          const matched = existingPermissions.find((perm) => perm.menuId === menu.id);
          return matched || {
            menuId: menu.id,
            read: false,
            write: false,
            delete: false,
          };
        });
  
        setMenuPermissions(initializedPermissions);
      });
    }
  }, [selectedRoleId, menus]);
  
  // 3. 권한 체크박스 토글
  const togglePermission = (
    menuId: number,
    field: keyof Omit<MenuPermission, 'menuId'>
  ) => {
    setMenuPermissions((prev) =>
      prev.map((item) =>
        item.menuId === menuId ? { ...item, [field]: !item[field] } : item
      )
    );
  };

  // 4. 저장
  const handleSave = async () => {
    if (selectedRoleId === null) return;

    try {
      await saveRoleMenus(selectedRoleId, menuPermissions);
      alert('메뉴 권한이 저장되었습니다.');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('메뉴 권한 저장 실패');
    }
  };

  return (
    <div className="flex p-6 space-x-6">
      {/* 좌측: 권한 그룹 리스트 */}
      <div className="w-1/3 border-r pr-4">
        <h2 className="font-bold text-lg mb-4">권한 그룹</h2>
        <ul>
          {roles.map((role) => (
            <li
              key={role.id}
              className={`p-2 cursor-pointer rounded hover:bg-blue-100 ${
                selectedRoleId === role.id ? 'bg-blue-200 font-semibold' : ''
              }`}
              onClick={() => setSelectedRoleId(role.id!)}
            >
              {role.name}
            </li>
          ))}
        </ul>
      </div>

 {/* 우측: 메뉴 권한 매핑 */}
<div className="w-2/3">
  <h2 className="font-bold text-lg mb-4">메뉴 권한 매핑</h2>
  {selectedRoleId === null ? (
    <p className="text-gray-500">좌측에서 권한 그룹을 먼저 선택해주세요.</p>
  ) : (
    <>
      <table className="w-full border border-gray-300 text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border-b">메뉴명</th>
            <th className="p-2 border-b text-center">읽기</th>
            <th className="p-2 border-b text-center">쓰기</th>
            <th className="p-2 border-b text-center">삭제</th>
          </tr>
        </thead>
        <tbody>
          {menus.map((menu) => {
            const permission =
              menuPermissions.find((p) => p.menuId === menu.id) || {
                menuId: menu.id,
                read: false,
                write: false,
                delete: false,
              };

            return (
              <tr key={menu.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{menu.name}</td>
                <td className="p-2 text-center">
                  <input
                    type="checkbox"
                    checked={permission.read}
                    onChange={() => togglePermission(menu.id, 'read')}
                  />
                </td>
                <td className="p-2 text-center">
                  <input
                    type="checkbox"
                    checked={permission.write}
                    onChange={() => togglePermission(menu.id, 'write')}
                  />
                </td>
                <td className="p-2 text-center">
                  <input
                    type="checkbox"
                    checked={permission.delete}
                    onChange={() => togglePermission(menu.id, 'delete')}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-4 text-right">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          저장
        </button>
      </div>
    </>
  )}
</div>





    </div>
  );
};

export default RoleMenuMapping;
