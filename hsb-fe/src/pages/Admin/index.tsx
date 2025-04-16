// src/pages/Admin/Index.tsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/Layout/AdminLayout';
import { useNavigate } from 'react-router-dom';

const AdminIndex = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <AdminLayout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">관리자 메인 페이지</h1>
        <p className="text-lg text-gray-700">환영합니다, 관리자님!</p>
        <button
          onClick={handleLogout}
          className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          로그아웃
        </button>
      </div>
      </AdminLayout>
  );
};

export default AdminIndex;
