// src/components/PrivateRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePermission } from '../../context/PermissionContext';

const PrivateRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { menuPermissions, isLoaded } = usePermission();
  const location = useLocation();
  const pathname = location.pathname;

  // 세션 상태 확인 중에는 로딩 UI 또는 null 렌더링
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // 메뉴 권한 로드 후: 현재 path가 read 권한과 매칭되는지 검사
  const permissions = menuPermissions ?? [];
  const hasMenuAccess =
    pathname === '/admin/index' ||
    (permissions.length > 0 &&
      permissions.some(
        (m) =>
          m.read &&
          (pathname === m.url || pathname.startsWith(m.url + '/'))
      ));

  // 권한 로드 전에는 통과 (사이드바에서 로드 후 재검사됨)
  if (!isLoaded) {
    return <Outlet />;
  }
  // 매칭되는 메뉴가 있거나 대시보드면 통과
  if (hasMenuAccess) {
    return <Outlet />;
  }
  // 권한 없음 → 대시보드로 리다이렉트
  return <Navigate to="/admin/index" replace />;
};

export default PrivateRoute;
