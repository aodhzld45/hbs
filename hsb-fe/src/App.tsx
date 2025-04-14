// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 관리자 페이지 imports
import ContentManagerDetail from "./pages/Admin/Hbs/ContentManagerDetail";
import AdminLogin from "./pages/Admin/Login";
import AdminDashboard from "./pages/Admin/AdminDashboard";

// 사용자 페이지 imports
import ContentManager from './pages/Admin/Hbs/ContentManager';
import EventForm from './pages/Admin/EventForm';
import EventPage from './pages/EventPage';
import MediaPage from './pages/MediaPage';
import MainPage from './pages/MainPage';
import PromPage from './pages/PromPage';
import HbsCardList from './components/Hbs/HbsCardList';
import HbsDetailPage from './pages/hbs/HbsDetailPage';

// 관리자 Common imports
import PrivateRoute from './components/Admin/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    // AuthProvider를 전체를 감싸서 전역 인증 상태를 모든 페이지에서 사용할 수 있도록 함
    <AuthProvider>
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
          </Route>
          <Route path="/admin/event-form" element={<EventForm />} />
          <Route path="/admin/content-manager" element={<ContentManager />} />
          <Route path="/admin/hbs/:fileId" element={<ContentManagerDetail />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
