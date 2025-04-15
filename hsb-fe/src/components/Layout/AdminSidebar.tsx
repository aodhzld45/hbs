// src/components/Layout/AdminSidebar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Layout } from 'lucide-react'; // Lucide 아이콘 추천

interface Props {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const AdminSidebar: React.FC<Props> = ({ isOpen, toggleSidebar }) => {
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
        <Link to="/admin/dashboard" className="block p-2 hover:bg-gray-200 rounded">📊 {isOpen && '대시보드'}</Link>
        <Link to="/admin/admin-menu" className="block p-2 hover:bg-gray-200 rounded">🛠 {isOpen && '메뉴 설정'}</Link>
        <Link to="/admin/content-manager" className="block p-2 hover:bg-gray-200 rounded">📁 {isOpen && '콘텐츠 관리'}</Link>
        <Link to="/admin/admin-manager" className="block p-2 hover:bg-gray-200 rounded">👤 {isOpen && '사용자 관리'}</Link>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
