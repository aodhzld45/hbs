// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 관리자 페이지 imports
import ContentManager from './pages/Admin/Content/ContentManager';
import ContentManagerDetail from "./pages/Admin/Content/ContentManagerDetail";
import AdminLogin from "./pages/Admin/Login";
import AdminDashboard from "./pages/Admin";
import AdminList from "./pages/Admin/AdminAccountManagement";
import AdminCreate from "./pages/Admin/AdminRegister";
import AdminMenu from "./pages/Admin/Menu/AdminMenuManagement";
import AdminAuthManagement from './pages/Admin/Role/AdminRoleManagement';
import AdminLogManager from './pages/Admin/Log/AdminLogManager';
import UserMenuManager from './pages/Admin/Menu/UserMenuManager';
import CodeManager from "./pages/Admin/Code/CodeManager"
import ContactManager from "./pages/Admin/Contact/ContactManager";
import ContactDetail from "./pages/Admin/Contact/ContactDetail";
import PopupBannerManager from './pages/Admin/Main/PopupBannerManager';

import PageManager from './pages/Admin/Page/PageManager';
import PageSectionManager from './pages/Admin/Page/PageSectionManager';

// 관리자 공통 게시판 관련 imports
import BoardManager from './pages/Admin/Board/BoardManager';
import BoardWrite from './pages/Admin/Board/BoardWrite';
import BoardDetail from "./pages/Admin/Board/BoardDetail";


// 사용자 페이지 imports
import MainPage from './pages/MainPage';
import BoardList from './components/Board/BoardList';
import UserBoardDetail from './components/Board/BoardDetail';
import ContentsList from './components/Contents/ContentsList';
import ContentDetail from './components/Contents/ContentDetail';
import ContactForm from './components/Contact/ContactForm';

// 각종 테스트용 imports
import TestPage from './pages/User/TestPage';

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
            <Route path="/:boardType/board-list" element={<BoardList />} />
            <Route path="/:boardType/board-detail/:id" element={<UserBoardDetail />} />
            <Route path="/:fileType/:contentType/list" element={<ContentsList />} />
            <Route path="/:fileType/:contentType/detail/:fileId" element={<ContentDetail />} />
            <Route path="/contact" element={<ContactForm />} />
            <Route path="/test" element={<TestPage />} />


            {/* 관리자 공용 라우트 (로그인 페이지) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* 관리자 보호 라우트 */}
            <Route element={<PrivateRoute />}>
              <Route path="/admin/index" element={<AdminDashboard />} />
              <Route path="/admin/page-manager" element={<PageManager />} />

              <Route path="/admin/content-manager" element={<ContentManager />} />
              <Route path="/admin/content-manager/:fileId" element={<ContentManagerDetail />} />
              <Route path="/admin/admin-manager" element={<AdminList />} />
              <Route path="/admin/auth-management" element={<AdminAuthManagement />} />
              <Route path="/admin/admin-create" element={<AdminCreate />} />
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

              <Route path='/admin/main/popup-banner-manager' element={<PopupBannerManager />} />
            </Route>
            
            <Route path="/admin/hbs/:fileId" element={<ContentManagerDetail />} />
          </Routes>
        </Router>
      </PermissionProvider>
    </AuthProvider>
  );
}

export default App;
