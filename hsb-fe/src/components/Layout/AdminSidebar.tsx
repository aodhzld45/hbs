// src/components/Layout/AdminSidebar.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { fetchRoleMenus } from "../../services/Admin/roleApi";
import { useAuth } from '../../context/AuthContext';
import { MenuPermission } from '../../types/Admin/RoleGroup';

import { usePermission } from '../../context/PermissionContext';
//const { refreshToken } = usePermission(); // ✅

interface Props {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const AdminSidebar: React.FC<Props> = ({ isOpen, toggleSidebar }) => {
  const [permissions, setPermissions] = useState<MenuPermission[]>([]);
  const [selectedParent, setSelectedParent] = useState<number | null>(null);
  const location = useLocation();
  const auth = useAuth();

  // 권한 기반 메뉴 로딩
  useEffect(() => {
    const loadData = async () => {
      try {
        if (auth.admin?.groupId) {
          const roleMenuRes = await fetchRoleMenus(auth.admin.groupId);
          const readPermissions = roleMenuRes.menuPermissions?.filter((m) => m.read) || [];
          setPermissions(readPermissions);
        }
      } catch (error) {
        console.error('사이드바 권한 메뉴 로드 실패:', error);
      }
    };
    loadData();
  }, [auth.admin?.groupId]);

  // 현재 경로로부터 parentId 자동 설정
  useEffect(() => {
    const matched = permissions
      .filter((menu) => menu.depth === 2 && location.pathname.startsWith(menu.url))
      .sort((a, b) => b.url.length - a.url.length)[0];
  
    if (matched) {
      setSelectedParent(matched.parentId ?? null);
    }
  }, [location.pathname, permissions]);

  // 1depth 메뉴 필터링
  const topMenus = permissions.filter((menu) => menu.depth === 1);

  // 선택된 1depth의 2depth 메뉴 필터링
  const secondMenus = permissions.filter(
    (menu) => menu.depth === 2 && menu.parentId === selectedParent
  );

  return (
    <aside className={`transition-all duration-300 bg-gray-100 border-r h-full ${
      isOpen ? 'w-64' : 'w-16'
    } overflow-hidden`}>
      <div className="p-4 flex justify-between items-center">
        <button onClick={toggleSidebar}>
          <Menu size={20} />
        </button>
        {isOpen && (
          <div className="text-center w-full">
            <span className="text-lg font-bold">HBS CMS</span>
          </div>
        )}
      </div>
      <nav className="p-2 space-y-1">
        {topMenus.map((menu) => {
          const isSelected = selectedParent === menu.menuId;
  
          return (
            <div key={menu.menuId}>
              <button
                onClick={() =>
                  setSelectedParent((prev) => (prev === menu.menuId ? null : menu.menuId))
                }
                className={`border block w-full text-left p-2 rounded font-semibold
                  ${isSelected ? 'bg-blue-100 text-blue-600 font-bold' : 'hover:bg-gray-200'}
                `}
              >
                {isOpen ? menu.name : menu.name.charAt(0)}
              </button>
  
              {isSelected && isOpen && (
                <div className="ml-4">
                  {secondMenus.map((child) => (
                    <Link
                      key={child.menuId}
                      to={child.url}
                      className={`block p-1 text-sm rounded border-b last:border-0 ${
                        location.pathname.startsWith(child.url)
                          ? 'bg-blue-100 text-blue-600 font-bold'
                          : 'hover:bg-gray-200'
                      }`}
                    >
                      └ {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
