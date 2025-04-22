// src/components/Layout/AdminSidebar.tsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { AdminMenu } from '../../types/Admin/AdminMenu';
import { fetchAdminMenus } from '../../services/Admin/adminMenuApi';


interface Props {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const AdminSidebar: React.FC<Props> = ({ isOpen, toggleSidebar }) => {
  const [menus, setMenus] = useState<AdminMenu[]>([]);
  const [selectedParent, setSelectedParent] = useState<number | null>(null);
  const location = useLocation();

  useEffect(() => {
    const loadMenus = async () => {
      try {
        const data = await fetchAdminMenus();
        setMenus(data);
      } catch (error) {
        console.error('메뉴 로드 실패:', error);
      }
    };

    loadMenus();
  }, []);

    // 현재 경로에 따라 자동으로 selectedParent 설정
    useEffect(() => {
      const matched = menus.find(
        (menu) => menu.depth === 2 && menu.url === location.pathname
      );
      if (matched) {
        setSelectedParent(matched?.parentId ?? null);
      }
    }, [location.pathname, menus]);
  
  // 1뎁스 메뉴 필터링: depth가 1인 메뉴들
  const topMenus = menus.filter(
    (menu) => menu.depth === 1 && menu.useTf === 'Y' && menu.delTf === 'N'
  );

  // 선택된 1뎁스 메뉴의 id와 일치하는 2뎁스 메뉴들 필터링
  const secondMenus = menus.filter(
    (menu) =>
      menu.depth === 2 &&
      menu.parentId === selectedParent &&
      menu.useTf === 'Y' &&
      menu.delTf === 'N'
  );

  return (
    <aside
      className={`transition-all duration-300 bg-gray-100 border-r h-full ${
        isOpen ? 'w-64' : 'w-16'
      } overflow-hidden`}
    >
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
        {topMenus.map((menu) => (
          <div key={menu.id}>
            <button
              onClick={() =>
                setSelectedParent((prev) => (prev === menu.id ? null : menu.id ?? null))
              }              
              className="border-2 border-solid block w-full text-left p-2 hover:bg-gray-200 rounded font-semibold"
            >
              {isOpen ? menu.name : menu.name.charAt(0)}
            </button>
            {/* 선택된 1뎁스 메뉴에 대해 2뎁스 메뉴 렌더링 */}
            {selectedParent === menu.id && isOpen && secondMenus.length > 0 && (
              <div className="ml-4"> 
                {secondMenus.map((child) => (
                  <Link
                    key={child.id}
                    to={child.url}
                    className={`block p-1 text-sm rounded border-b last:border-0 ${
                      location.pathname === child.url
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
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
