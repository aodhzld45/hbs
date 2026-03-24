import { useEffect, useMemo, useState } from 'react';
import { Route } from 'react-router-dom';

import AdminLayout from '../../components/Layout/AdminLayout';
import { fetchAdminMenus } from '../../services/Admin/adminMenuApi';
import type { AdminMenu } from '../../types/Admin/AdminMenu';
import { resolveAdminRouteComponent } from './adminRouteRegistry';
import { useAuthStore } from '../../store/useAuthStore';

function AdminRouteConfigurationNotice({
  menuName,
  componentKey,
}: {
  menuName: string;
  componentKey: string;
}) {
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">라우트 컴포넌트 매핑이 필요합니다.</p>
          <p className="mt-2">메뉴명: {menuName}</p>
          <p className="mt-1">componentKey: {componentKey || '(비어 있음)'}</p>
        </div>
      </div>
    </AdminLayout>
  );
}

export function useAdminDynamicRoutes() {
  const [menus, setMenus] = useState<AdminMenu[]>([]);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    let mounted = true;

    const loadMenus = async () => {
      if (isAuthLoading) {
        return;
      }

      if (!isAuthenticated) {
        if (mounted) {
          setMenus([]);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        const data = await fetchAdminMenus();

        if (!mounted) {
          return;
        }

        setMenus(data);
      } catch (error) {
        console.error('관리자 동적 라우트 로드 실패:', error);

        if (mounted) {
          setMenus([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadMenus();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, isAuthLoading]);

  const routes = useMemo(() => {
    const registeredPaths = new Set<string>();

    return menus
      .filter(
        (menu) =>
          menu.useTf === 'Y' &&
          menu.delTf !== 'Y' &&
          Boolean(menu.url) &&
          menu.url.startsWith('/admin') &&
          menu.url !== '/admin/index'
      )
      .sort((a, b) => (a.orderSequence ?? 0) - (b.orderSequence ?? 0))
      .flatMap((menu) => {
        if (registeredPaths.has(menu.url)) {
          return [];
        }

        registeredPaths.add(menu.url);

        const ResolvedComponent = resolveAdminRouteComponent(
          menu.componentKey,
          menu.url
        );

        if (!ResolvedComponent) {
          return [
            <Route
              key={menu.url}
              path={menu.url}
              element={
                <AdminRouteConfigurationNotice
                  menuName={menu.name}
                  componentKey={menu.componentKey}
                />
              }
            />,
          ];
        }

        return [
          <Route
            key={menu.url}
            path={menu.url}
            element={<ResolvedComponent />}
          />,
        ];
      });
  }, [menus]);

  return { routes, loading };
}