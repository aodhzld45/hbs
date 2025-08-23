// src/components/Layout/AdminHeader.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Props {
  toggleSidebar: () => void;
}

const AdminHeader: React.FC<Props> = ({ toggleSidebar }) => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <header className="bg-blue-600 text-white py-4 px-4 flex items-center justify-between">
      {/* 좌측: 햄버거 + 로고 */}
      <div className="flex items-center space-x-4">
        {/* 햄버거 버튼 */}
        <button
          onClick={toggleSidebar}
          className="block"
        >
          <Menu size={24} />
        </button>

        {/* 로고 */}
        <div className="text-xl font-bold">
          <Link to="/admin/index">HSBS</Link>
        </div>
      </div>

      {/* 우측 메뉴 - PC 전용 */}
      <div className="hidden md:flex items-center space-x-4">
        <span className="text-lg">
          {admin?.name ? admin.name : '관리자'}
        </span>
        <button
          onClick={() => navigate('/admin/profile')}
          className="hover:underline"
        >
          내 정보 조회
        </button>
        <button
          onClick={handleLogout}
          className="hover:underline"
        >
          로그아웃
        </button>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          홈페이지
        </a>
      </div>
    </header>
  );
};

export default AdminHeader;
