// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 관리자 페이지 imports
import ContentManager from './pages/Admin/Hbs/ContentManager';
import ContentManagerDetail from "./pages/Admin/Hbs/ContentManagerDetail";
import AdminLogin from "./pages/Admin/Login";
import AdminDashboard from "./pages/Admin";
import AdminList from "./pages/Admin/AdminAccountManagement";
import AdminCreate from "./pages/Admin/AdminRegister";
import AdminMenu from "./pages/Admin/Menu/AdminMenuManagement";
import AdminAuthManagement from './pages/Admin/Role/AdminRoleManagement';
import CodeParentManagement from "./pages/Admin/Code/CodeParentManagement";

// 관리자 공통 게시판 관련 imports
import BoardManager from './pages/Admin/Board/BoardManager';
import BoardWrite from './pages/Admin/Board/BoardWrite';
import BoardDetail from "./pages/Admin/Board/BoardDetail";


// 사용자 페이지 imports
import EventForm from './pages/Admin/EventForm';
import EventPage from './pages/EventPage';
import MediaPage from './pages/MediaPage';
import MainPage from './pages/MainPage';
import PromPage from './pages/PromPage';
import HbsCardList from './components/Hbs/HbsCardList';
import HbsDetailPage from './pages/User/hbs/HbsDetailPage';

// 관리자 Common imports
import PrivateRoute from './components/Admin/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import { PermissionProvider } from './context/PermissionContext';



function App() {
  return (
    // AuthProvider를 전체를 감싸서 전역 인증 상태를 모든 페이지에서 사용할 수 있도록 함
    <AuthProvider>
      <PermissionProvider>
        <Router>
          <Routes>
            {/* 사용자 공용 라우트 */}
            <Route path="/" element={<MainPage />} />
            <Route path="/hbs-list" element={<HbsCardList />} />
            <Route path="/prom" element={<PromPage />} />
            <Route path="/event" element={<EventPage />} />
            <Route path="/media" element={<MediaPage />} />
            <Route path="/content-files/:fileId" element={<HbsDetailPage />} />

            {/* 관리자 공용 라우트 (로그인 페이지) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* 관리자 보호 라우트 */}
            <Route element={<PrivateRoute />}>
              <Route path="/admin/index" element={<AdminDashboard />} />
              <Route path="/admin/content-manager" element={<ContentManager />} />
              <Route path="/admin/admin-manager" element={<AdminList />} />
              <Route path="/admin/auth-management" element={<AdminAuthManagement />} />
              <Route path="/admin/admin-create" element={<AdminCreate />} />
              <Route path="/admin/admin-menu" element={<AdminMenu />} />
              <Route path="/admin/code-parent" element={<CodeParentManagement />} />
              
              <Route path="/admin/board/:boardType" element={<BoardManager />} />
              <Route path="/admin/board/:boardType/write" element={<BoardWrite />} />
              <Route path="/admin/board/:boardType/edit/:id" element={<BoardWrite />} />
              <Route path="/admin/board/:boardType/detail/:id" element={<BoardDetail />} />

            </Route>
            <Route path="/admin/event-form" element={<EventForm />} />
            
            <Route path="/admin/hbs/:fileId" element={<ContentManagerDetail />} />
          </Routes>
        </Router>
      </PermissionProvider>
    </AuthProvider>
  );
}

export default App;
