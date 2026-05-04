// src/components/PrivateRoute.tsx
import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { usePermission } from '../../context/PermissionContext';
import { SESSION_EXPIRED_EVENT } from '../../services/api';
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
  const hasToken = Boolean(localStorage.getItem('jwtToken'));
  const redirectQuery = `redirect=${encodeURIComponent(location.pathname + location.search)}`;
  const loginRedirect =
    isAuthenticated && !hasToken
      ? `/admin/login?reason=session-expired&${redirectQuery}`
      : `/admin/login?${redirectQuery}`;

  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasToken) {
      window.dispatchEvent(
        new CustomEvent(SESSION_EXPIRED_EVENT, {
          detail: {
            message: '인증이 만료되었습니다. 다시 로그인해주세요.',
            redirectTo: location.pathname + location.search,
          },
        })
      );
    }
  }, [hasToken, isAuthenticated, isLoading, location.pathname, location.search]);

  if (isLoading) {
    return (
      <AdminLayout>
        <PageLoader />
      </AdminLayout>
    );
  }

  if (!isAuthenticated || !hasToken) {
    return <Navigate to={loginRedirect} replace state={{ from: location }} />;
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
