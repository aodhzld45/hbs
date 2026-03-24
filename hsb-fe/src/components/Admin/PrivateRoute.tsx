// src/components/PrivateRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { usePermission } from '../../context/PermissionContext';
import PageLoader from '../../features/common/PageLoader';
import AdminLayout from '../Layout/AdminLayout';

const normalizePath = (path?: string) => {
  if (!path) return '';
  return path.replace(/\/+$/, '');
};

const PrivateRoute: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  const { menuPermissions, isLoaded } = usePermission();
  const location = useLocation();

  const pathname = normalizePath(location.pathname);
  const permissions = menuPermissions ?? [];

  if (isLoading) {
    return (
      <AdminLayout>
        <PageLoader />
      </AdminLayout>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // 권한 데이터가 아직 준비되지 않았으면 일단 통과
  // (상위 App.tsx에서 adminRoutesLoading 로더 처리와 함께 써야 안정적)
  if (!isLoaded) {
    return (
      <AdminLayout>
        <PageLoader />
      </AdminLayout>
    );
  }

  const matchedPermission = permissions.find((m) => {
    const menuUrl = normalizePath(m.url);

    return (
      m.read &&
      menuUrl &&
      (pathname === menuUrl || pathname.startsWith(`${menuUrl}/`))
    );
  });

  const hasMenuAccess =
    pathname === '/admin/index' || Boolean(matchedPermission);

  if (hasMenuAccess) {
    return <Outlet />;
  }

  return <Navigate to="/admin/index" replace />;
};

export default PrivateRoute;