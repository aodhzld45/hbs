// src/components/Layout/AdminHeader.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminMenu } from '../../types/Admin/AdminMenu';
import { fetchAdminMenus } from '../../services/Admin/adminMenuApi';

const AdminHeader: React.FC = () => {
  const [menus, setMenus] = useState<AdminMenu[]>([]);

  useEffect(() => {
    const loadMenus = async () => {
      try {
        const data = await fetchAdminMenus();
        // 1뎁스 메뉴 중 사용중이고 삭제되지 않은 메뉴만 필터링
        const topMenus = data.filter(
          (menu) => menu.depth === 1 && menu.useTf === 'Y' && menu.delTf === 'N'
        );
        setMenus(topMenus);
      } catch (error) {
        console.error('메뉴 로드 실패:', error);
      }
    };

    loadMenus();
  }, []);

  return (
    <header className="bg-blue-600 text-white py-4 px-8">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-xl font-bold">관리자 패널</div>
        <nav>
          <ul className="flex space-x-4">
            {menus.map((menu) => (
              <li key={menu.id}>
                <Link to={menu.url} className="hover:underline">
                  {menu.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default AdminHeader;
