// src/App.tsx
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 관리자 페이지 imports
import ContentManager from './pages/Admin/Content/ContentManager';
import ContentManagerDetail from "./pages/Admin/Content/ContentManagerDetail";

import SqlProblemManager from './features/admin/SqlProblem';
import SqlProblemDetail from './features/admin/SqlProblem/components/SqlProblemDetail';

import AdminLogin from "./pages/Admin/Login";
import AdminDashboard from "./pages/Admin";
import AdminList from "./pages/Admin/AdminAccountManagement";
import AdminCreate from "./pages/Admin/AdminRegister";
import AdminProfile from './components/Admin/Account/AdminProfile';
import AdminMenu from "./pages/Admin/Menu/AdminMenuManagement";
import AdminAuthManagement from './pages/Admin/Role/AdminRoleManagement';
import AdminLogManager from './pages/Admin/Log/AdminLogManager';
import UserMenuManager from './pages/Admin/Menu/UserMenuManager';
import CodeManager from "./pages/Admin/Code/CodeManager"

import ContactManager from "./features/admin/Contact/index";
import ContactDetail from "./features/admin/Contact/components/ContactDetail";

import CorsOriginPage from "./features/admin/CorsOrigin";
import MaintenanceRulePage from "./features/admin/MaintenanceRule";

import PopupBannerManager from './pages/Admin/Main/PopupBannerManager';

import PageManager from './pages/Admin/Page/PageManager';

// 관리자 공통 게시판 관련 imports
import BoardManager from './pages/Admin/Board/BoardManager';
import BoardWrite from './pages/Admin/Board/BoardWrite';
import BoardDetail from "./pages/Admin/Board/BoardDetail";

// 사용자 메뉴 Url 가드
import { UserMenuProvider } from './context/UserMenuContext';
import UserRouteGuard from './components/Route/UserRouteGuard';
import ComingSoonPage from './components/Common/ComingSoonPage'; // 혹시 404용으로도 쓸 거면

// 사용자 페이지 imports
import MainPage from './pages/MainPage';
import BoardList from './components/Board/BoardList';
import UserBoardDetail from './components/Board/BoardDetail';
import ContentsList from './components/Contents/ContentsList';
import ContentDetail from './components/Contents/ContentDetail';

import ContactForm from './features/user/Contact/index';

// 각종 테스트용 imports
import AIPlayground from './features/user/OpenAI/AIPlayground';

import AdminSiteKeys from './features/admin/Ai/AdminSiteKeys';
import AdminWidgetConfig from './features/admin/Ai/AdminWidgetConfig';
import AdminPromptProfile from './features/admin/Ai/PromptProfile';
import AdminUsageStats from './features/admin/Ai/AdminUsageStats';

import TestPage from './pages/User/TestPage';
import SqlProblemTestPage from './features/admin/SqlProblem/SqlProblemTestPage';
import KisPage from './features/user/Kis';

// 관리자 Common imports
import PrivateRoute from './components/Admin/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import { PermissionProvider } from './context/PermissionContext';

type MaintenanceType = 'MAINTENANCE' | 'COMING_SOON' | 'NOTICE';

type MaintenanceConfig = {
  enabled: boolean;
  type?: MaintenanceType;
  title?: string;
  description?: string;
  expectedEndAt?: string; // ISO string
  helpText?: string;
  helpHref?: string;
  checkIntervalSec?: number;
};

const DEFAULT_CONFIG: MaintenanceConfig= {
  enabled: false,
  type: 'MAINTENANCE',
}

async function fetchMaintenanceConfig(): Promise<MaintenanceConfig> {
  try {
    // 캐시 방지(중요): 파일만 바꿔도 바로 반영되도록
    const res = await fetch(`/maintenance.json?t=${Date.now()}`, {
      cache: 'no-store',
    });
    if (!res.ok) return DEFAULT_CONFIG;

    const data = (await res.json()) as Partial<MaintenanceConfig>;
    return {
      ...DEFAULT_CONFIG,
      ...data,
      enabled: Boolean(data.enabled),
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

function App() {
  const [checked, setChecked] = useState(false);
  const [maintenance, setMaintenance] = useState<MaintenanceConfig>(DEFAULT_CONFIG);
  
  useEffect(() => {
    let alive = true;
    let timer: number | null = null;

    const tick = async () => {
      const cfg = await fetchMaintenanceConfig();
      if (!alive) return;

      setMaintenance(cfg);
      if (!checked) setChecked(true);

      const sec = Math.max(5, Number(cfg.checkIntervalSec ?? 15));
      timer = window.setTimeout(tick, sec * 1000);
    };

    tick();
    return () => {
      alive = false;
      if (timer) window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 최초 체크 전: 깜빡임 방지
  if (!checked) return null;

  // 점검 모드면 “어떤 URL이든” ComingSoonPage만
  if (maintenance.enabled) {
    return (
      <AuthProvider>
        <PermissionProvider>
          <Router>
            <Routes>
              <Route
                path="*"
                element={
                  <ComingSoonPage
                    type={maintenance.type ?? 'MAINTENANCE'}
                    title={maintenance.title}
                    description={maintenance.description}
                    expectedEndAt={maintenance.expectedEndAt}
                    helpText={maintenance.helpText}
                    helpHref={maintenance.helpHref}
                  />
                }
              />
            </Routes>
          </Router>
        </PermissionProvider>
      </AuthProvider>
    );
  }


  return (
    // AuthProvider를 전체를 감싸서 전역 인증 상태를 모든 페이지에서 사용할 수 있도록 함
    <AuthProvider>
      <PermissionProvider>
        <Router>
          <UserMenuProvider>
            <Routes>
              {/* 사용자 보호 라우트 가드 */}
              <Route element={<UserRouteGuard />}>
                <Route path="/" element={<MainPage />} />
                <Route path="/:boardType/board-list" element={<BoardList />} />
                <Route path="/:boardType/board-detail/:id" element={<UserBoardDetail />} />
                <Route path="/:fileType/:contentType/list" element={<ContentsList />} />
                <Route path="/:fileType/:contentType/detail/:fileId" element={<ContentDetail />} />
                <Route path="/contact" element={<ContactForm />} />
                <Route path="/test" element={<TestPage />} />
                <Route path="/test/2depth" element={<SqlProblemTestPage />} />
                <Route path="/test/kis" element={<KisPage />} />
                <Route path="/test/ai" element={<AIPlayground />} />
              </Route>  

              {/* 관리자 공용 라우트 (로그인 페이지) */}
              <Route path="/admin/login" element={<AdminLogin />} />
              
              {/* 관리자 보호 라우트 가드 */}
              <Route element={<PrivateRoute />}>
                <Route path="/admin/index" element={<AdminDashboard />} />
                <Route path="/admin/page-manager" element={<PageManager />} />

                <Route path="/admin/content-manager" element={<ContentManager />} />
                <Route path="/admin/content-manager/:fileId" element={<ContentManagerDetail />} />

                <Route path="/admin/ai/site-keys" element={<AdminSiteKeys />} />
                <Route path="/admin/ai/widget-configs" element={<AdminWidgetConfig />} />
                <Route path="/admin/ai/prompt-profiles" element={<AdminPromptProfile />} />
                <Route path="/admin/ai/usage-stats" element={<AdminUsageStats />} />

                <Route path="/admin/sql-manager" element={<SqlProblemManager />} />
                <Route path="/admin/sql-manager/:id" element={<SqlProblemDetail />} />

                <Route path="/admin/admin-manager" element={<AdminList />} />
                <Route path="/admin/auth-management" element={<AdminAuthManagement />} />
                <Route path="/admin/admin-create" element={<AdminCreate />} />
                <Route path="/admin/profile" element={<AdminProfile />} />

                <Route path="/admin/admin-menu" element={<AdminMenu />} />
                <Route path="/admin/log-manager" element={<AdminLogManager />} />

                <Route path="/admin/user-menu-manager" element={<UserMenuManager />} />

                <Route path="/admin/code-manager" element={<CodeManager />} />
                
                <Route path="/admin/board/:boardType" element={<BoardManager />} />
                <Route path="/admin/board/:boardType/write" element={<BoardWrite />} />
                <Route path="/admin/board/:boardType/edit/:id" element={<BoardWrite />} />
                <Route path="/admin/board/:boardType/detail/:id" element={<BoardDetail />} />

                <Route path="/admin/contact" element={<ContactManager />} />
                <Route path="/admin/contact/detail/:id" element={<ContactDetail />} />

                <Route path="/admin/cors-origins" element={<CorsOriginPage />} />
                <Route path="/admin/maintenance" element={<MaintenanceRulePage />} />

                <Route path='/admin/main/popup-banner-manager' element={<PopupBannerManager />} />
              </Route>
              
              <Route path="/admin/hbs/:fileId" element={<ContentManagerDetail />} />
            </Routes>
          </UserMenuProvider>
        </Router>
      </PermissionProvider>
    </AuthProvider>
  );
}

export default App;
