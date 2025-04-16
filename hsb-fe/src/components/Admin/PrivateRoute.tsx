// src/components/PrivateRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  console.log('PrivateRoute - isAuthenticated:', isAuthenticated);

  // 세션 상태 확인 중에는 로딩 UI 또는 null 렌더링
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // 인증 상태에 따라 보호된 페이지를 보여주거나 로그인 페이지로 리다이렉션
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default PrivateRoute;
