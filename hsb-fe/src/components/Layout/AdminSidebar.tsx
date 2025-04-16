// src/components/Layout/AdminSidebar.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Layout } from 'lucide-react'; // Lucide 아이콘 추천
import { AdminMenu } from '../../types/Admin/AdminMenu';
import { fetchAdminMenus } from '../../services/Admin/adminMenuApi';

interface Props {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const AdminSidebar: React.FC<Props> = ({ isOpen, toggleSidebar }) => {
  const [menus, setMenus] = useState<AdminMenu[]>([]);

  useEffect(() => {
    const loadMenus = async () => {
      try {
        const data = await fetchAdminMenus();
        // 예시로 1뎁스 메뉴 중 사용('Y')이고 삭제되지 않은('N') 메뉴만 필터링
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
    <aside className={`transition-all duration-300 bg-gray-100 border-r h-full ${isOpen ? 'w-64' : 'w-16'} overflow-hidden`}>
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
      {menus.map((menu) => (
          <Link
            key={menu.id}
            to={menu.url}
            className="block p-2 hover:bg-gray-200 rounded"
          >
            {isOpen ? menu.name : menu.name.charAt(0)}
          </Link>
        ))}
        <Link to="/admin/dashboard" className="block p-2 hover:bg-gray-200 rounded">📊 {isOpen && '대시보드'}</Link>
        <Link to="/admin/admin-menu" className="block p-2 hover:bg-gray-200 rounded">🛠 {isOpen && '메뉴 설정'}</Link>
        <Link to="/admin/content-manager" className="block p-2 hover:bg-gray-200 rounded">📁 {isOpen && '콘텐츠 관리'}</Link>
        <Link to="/admin/admin-manager" className="block p-2 hover:bg-gray-200 rounded">👤 {isOpen && '사용자 관리'}</Link>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
