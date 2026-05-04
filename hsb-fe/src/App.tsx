import { BrowserRouter as Router, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

import ContentManagerDetail from './pages/Admin/Content/ContentManagerDetail';
import SqlProblemDetail from './features/admin/SqlProblem/components/SqlProblemDetail';
import AdminLogin from './pages/Admin/Login';
import AdminCreate from './pages/Admin/AdminRegister';
import AdminProfile from './components/Admin/Account/AdminProfile';
import ContactDetail from './features/admin/Contact/components/ContactDetail';
import BlockIpPage from './components/Common/BlockedIpPage';
import BoardManager from './pages/Admin/Board/BoardManager';
import BoardWrite from './pages/Admin/Board/BoardWrite';
import BoardDetail from './pages/Admin/Board/BoardDetail';
import BoardConfigWrite from './pages/Admin/BoardConfig/BoardConfigWrite';
import { UserMenuProvider } from './context/UserMenuContext';
import UserRouteGuard from './components/Route/UserRouteGuard';
import MaintenanceRouteGuard from './components/Route/MaintenanceRouteGuard';
import ComingSoonPage from './components/Common/ComingSoonPage';
import MainPage from './pages/MainPage';
import BoardList from './components/Board/BoardList';
import UserBoardDetail from './components/Board/BoardDetail';
import ContentsList from './components/Contents/ContentsList';
import ContentDetail from './components/Contents/ContentDetail';
import ContactForm from './features/user/Contact';
import AIPlayground from './features/user/OpenAI/AIPlayground';
import TestPage from './pages/User/TestPage';
import SqlProblemTestPage from './features/admin/SqlProblem/SqlProblemTestPage';
import KisPage from './features/user/Kis';
import PrivateRoute from './components/Admin/PrivateRoute';
import { PermissionProvider, usePermission } from './context/PermissionContext';
import { useAuthStore } from './store/useAuthStore';
import { SESSION_EXPIRED_EVENT } from './services/api';

import { useAdminDynamicRoutes } from './routes/admin/useAdminDynamicRoutes';
import AdminIndex from './pages/Admin';
import AdminLayout from './components/Layout/AdminLayout';
import PageLoader from './features/common/PageLoader';

function SessionExpiredHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { setMenuPermissions, setIsLoaded } = usePermission();
  const lastAlertedAtRef = useRef(0);

  useEffect(() => {
    const handleSessionExpired = (event: Event) => {
      const detail = (event as CustomEvent<{
        message?: string;
        redirectTo?: string;
      }>).detail;
      const message = detail?.message || '인증이 만료되었습니다. 다시 로그인해주세요.';
      const redirectTo =
        detail?.redirectTo && detail.redirectTo.startsWith('/admin')
          ? detail.redirectTo
          : location.pathname + location.search;
      const now = Date.now();

      clearAuth();
      setMenuPermissions(null);
      setIsLoaded(false);

      if (now - lastAlertedAtRef.current > 1000) {
        lastAlertedAtRef.current = now;
        alert(message);
      }

      navigate(`/admin/login?reason=session-expired&redirect=${encodeURIComponent(redirectTo)}`, {
        replace: true,
      });
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, [clearAuth, location.pathname, location.search, navigate, setIsLoaded, setMenuPermissions]);

  return null;
}

function App() {
  useEffect(() => {
    useAuthStore.getState().checkSession();
  }, []);

  const {
    routes: adminDynamicRoutes,
    loading: adminRoutesLoading,
  } = useAdminDynamicRoutes();

  return (
    <PermissionProvider>
      <Router>
        <UserMenuProvider>
          <SessionExpiredHandler />
          <Routes>
            <Route element={<MaintenanceRouteGuard />}>
              <Route element={<UserRouteGuard />}>
                <Route path="/" element={<MainPage />} />

                <Route path="/:boardCode/board-list" element={<BoardList />} />
                <Route path="/:menuSegment/:boardCode/board-list" element={<BoardList />} />
                <Route path="/:boardCode/board-detail/:id" element={<UserBoardDetail />} />
                <Route path="/:menuSegment/:boardCode/board-detail/:id" element={<UserBoardDetail />} />

                <Route path="/:fileType/:contentType/list" element={<ContentsList />} />
                <Route path="/:fileType/:contentType/detail/:fileId" element={<ContentDetail />} />
                <Route path="/contact" element={<ContactForm />} />

                <Route path="/test" element={<TestPage />} />
                <Route path="/test/2depth" element={<SqlProblemTestPage />} />
                <Route path="/test/kis" element={<KisPage />} />
                <Route path="/test/ai" element={<AIPlayground />} />

                <Route
                  path="*"
                  element={
                    <ComingSoonPage
                      type="NOTICE"
                      title="존재하지 않는 페이지입니다."
                      description="입력하신 주소가 올바른지 확인해주세요."
                    />
                  }
                />
              </Route>
            </Route>

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/blocked-ip" element={<BlockIpPage />} />

            {adminRoutesLoading ? (
              <Route
                path="/admin/*"
                element={
                  <AdminLayout>
                    <PageLoader />
                  </AdminLayout>
                }
              />
            ) : (
              <Route element={<PrivateRoute />}>
                <Route path="/admin/index" element={<AdminIndex />} />

                {adminDynamicRoutes}

                <Route path="/admin/content-manager/:fileId" element={<ContentManagerDetail />} />
                <Route path="/admin/sql-manager/:id" element={<SqlProblemDetail />} />
                <Route path="/admin/admin-create" element={<AdminCreate />} />
                <Route path="/admin/profile" element={<AdminProfile />} />
                <Route path="/admin/board-config/write" element={<BoardConfigWrite />} />
                <Route path="/admin/board-config/:id/edit" element={<BoardConfigWrite />} />
                <Route path="/admin/board/write" element={<BoardWrite />} />
                <Route path="/admin/board/edit/:id" element={<BoardWrite />} />
                <Route path="/admin/board/:boardCode" element={<BoardManager />} />
                <Route path="/admin/board/:boardCode/write" element={<BoardWrite />} />
                <Route path="/admin/board/:boardCode/edit/:id" element={<BoardWrite />} />
                <Route path="/admin/board/:boardCode/detail/:id" element={<BoardDetail />} />
                <Route path="/admin/contact/detail/:id" element={<ContactDetail />} />
                <Route path="/admin/*" element={<Navigate to="/admin/index" replace />} />
              </Route>
            )}

            <Route path="/admin/hbs/:fileId" element={<ContentManagerDetail />} />
          </Routes>
        </UserMenuProvider>
      </Router>
    </PermissionProvider>
  );
}

export default App;
