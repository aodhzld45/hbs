// src/components/PrivateRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  console.log('PrivateRoute - isAuthenticated:', isAuthenticated); // 디버깅: 상태 출력
  // 인증되지 않았다면 로그인 페이지로 리다이렉션합니다.
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default PrivateRoute;
