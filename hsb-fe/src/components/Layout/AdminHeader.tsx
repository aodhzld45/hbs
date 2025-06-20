// src/components/Layout/AdminHeader.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminHeader: React.FC = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <header className="bg-blue-600 text-white py-4 px-8 flex items-center justify-between">
      {/* 좌측: HBS 텍스트 */}
      <div className="text-xl font-bold">
        <Link to="/admin/index">HBS</Link>
      </div>

      {/* 우측: 관리자 이름, 내 정보 조회, 로그아웃, 홈페이지 링크 */}
      <div className="flex items-center space-x-4">
        {/* 로그인한 관리자 이름 출력, 없으면 기본 텍스트 사용 */}
        <span className="text-lg">
          {admin?.name ? admin.name : '관리자'}
        </span>
        {/* 내 정보 조회 버튼 - 클릭 시 내 정보 페이지로 이동 */}
        <button 
          onClick={() => navigate('/admin/profile')}
          className="hover:underline"
        >
          내 정보 조회
        </button>
        {/* 로그아웃 버튼 */}
        <button 
          onClick={handleLogout}
          className="hover:underline">
          로그아웃
        </button>
        {/* 외부 홈페이지 링크 */}
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
