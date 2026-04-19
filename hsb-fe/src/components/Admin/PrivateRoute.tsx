// src/components/PrivateRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { usePermission } from '../../context/PermissionContext';
import PageLoader from '../../features/common/PageLoader';
import AdminLayout from '../Layout/AdminLayout';

const normalizePath = (path?: string) => {
  if (!path) return '';
  return path.replace(/\/+$/, '').toLowerCase();
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

  // Wait until permissions are loaded before evaluating route access.
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
