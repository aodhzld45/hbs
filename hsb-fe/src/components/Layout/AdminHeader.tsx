import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, LogOut, User, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Props {
  toggleSidebar: () => void;
}

const AdminHeader: React.FC<Props> = ({ toggleSidebar }) => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

       {/* 우측: 모바일 드롭다운 */}
      <div className="md:hidden relative" ref={menuRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="프로필 메뉴 열기"
          title="프로필"
        >
          <div className="h-6 w-6 rounded-full bg-white/80 text-blue-700 flex items-center justify-center text-xs font-bold">
            {(admin?.name ?? '관리자').slice(0, 2)}
          </div>
        </button>

        {open && (
          <div
            role="menu"
            tabIndex={-1}
            className="absolute right-0 mt-2 w-48 rounded-lg bg-white text-gray-900 shadow-lg ring-1 ring-black/10 overflow-hidden"
          >
            <button
              role="menuitem"
              onClick={() => { setOpen(false); navigate('/admin/profile'); }}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
            >
              <User size={16} /> 내 정보
            </button>
            <a
              role="menuitem"
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
            >
              <ExternalLink size={16} /> 홈페이지
            </a>
            <button
              role="menuitem"
              onClick={handleLogout}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
            >
              <LogOut size={16} /> 로그아웃
            </button>
          </div>
        )}
      </div>

    </header>
  );
};

export default AdminHeader;
