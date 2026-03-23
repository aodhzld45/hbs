import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';

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
// import { AuthProvider } from './context/AuthContext';
import { PermissionProvider } from './context/PermissionContext'
import { useAuthStore } from './store/useAuthStore';

import { useAdminDynamicRoutes } from './routes/admin/useAdminDynamicRoutes';
import AdminIndex from './pages/Admin';

function App() {
    useEffect(() => {
      useAuthStore.getState().checkSession();
    }, []);

  const { routes: adminDynamicRoutes, loading: adminRoutesLoading } = useAdminDynamicRoutes();
  return (
    // 관리자 인증 세션을 최상단에서 관리한다.
    // PrivateRoute와 관리자 전용 화면들이 이 컨텍스트를 사용해 로그인 상태를 판단한다.
    // <AuthProvider>
      <PermissionProvider>
        {/* 애플리케이션 전체 라우팅 루트. */}
        <Router>
          {/* 사용자 메뉴 설정을 라우트 가드에서 재사용하기 위한 Provider.
              UserRouteGuard가 현재 URL이 공개 메뉴인지 검사할 때 사용한다. */}
          <UserMenuProvider>
            <Routes>
              {/* 사용자 영역은 두 단계로 감싼다.
                  1. MaintenanceRouteGuard: 점검 여부와 경로별 차단 정책을 먼저 확인
                  2. UserRouteGuard: 실제 공개 메뉴인지 확인
                  즉, "서비스 정책"을 먼저 보고 그 다음 "메뉴 공개 여부"를 본다. */}
              <Route element={<MaintenanceRouteGuard />}>
                <Route element={<UserRouteGuard />}>
                  <Route path="/" element={<MainPage />} />

                  {/* 게시판은 메뉴 세그먼트 포함/미포함 URL을 모두 지원한다.
                      운영 중 URL 정책이 달라져도 같은 컴포넌트를 재사용하려는 목적이다. */}
                  <Route path="/:boardCode/board-list" element={<BoardList />} />
                  <Route path="/:menuSegment/:boardCode/board-list" element={<BoardList />} />
                  <Route path="/:boardCode/board-detail/:id" element={<UserBoardDetail />} />
                  <Route path="/:menuSegment/:boardCode/board-detail/:id" element={<UserBoardDetail />} />

                  {/* 콘텐츠 화면은 fileType/contentType 파라미터로 동작을 분기한다.
                      페이지를 여러 개 만들기보다 공통 화면을 URL 파라미터로 재사용하는 구조다. */}
                  <Route path="/:fileType/:contentType/list" element={<ContentsList />} />
                  <Route path="/:fileType/:contentType/detail/:fileId" element={<ContentDetail />} />
                  <Route path="/contact" element={<ContactForm />} />

                  {/* 테스트/임시 공개 라우트.
                      UserRouteGuard 내부의 publicPaths와 함께 유지되어야 한다. */}
                  <Route path="/test" element={<TestPage />} />
                  <Route path="/test/2depth" element={<SqlProblemTestPage />} />
                  <Route path="/test/kis" element={<KisPage />} />
                  <Route path="/test/ai" element={<AIPlayground />} />

                  {/* 사용자 영역 fallback.
                      정의되지 않은 URL 또는 접근 불가 경로는 안내 페이지로 보낸다. */}
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

              {/* 관리자 로그인 화면은 보호 라우트 바깥에 둔다.
                  비인증 상태에서도 접근 가능해야 하기 때문이다. */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/blocked-ip" element={<BlockIpPage />} />

              {/* 관리자 보호 영역.
                  보호 라우트가 사라진 것이 아니라, 현재는 모든 관리자 페이지를
                  PrivateRoute 하나로 묶어 공통 처리하는 구조다.
                  여기서 인증(AuthContext)과 메뉴 권한(PermissionContext)을 함께 검사한다. */}
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
              </Route>

              {/* 관리자 콘텐츠 직접 보기용 예외 라우트.
                  현재는 PrivateRoute 밖에 있으므로, 공개 의도가 맞는지 별도 확인이 필요하다. */}
              <Route path="/admin/hbs/:fileId" element={<ContentManagerDetail />} />
            </Routes>
          </UserMenuProvider>
        </Router>
      </PermissionProvider>
    // </AuthProvider>
  );
}

export default App;
