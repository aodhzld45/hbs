// src/components/Layout/AdminLayout.tsx
import React from 'react';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 상단 헤더 */}
      <AdminHeader />
      {/* 콘텐츠 영역: 헤더 아래에 페이지별 콘텐츠가 렌더링됩니다 */}
      <main className="flex-grow">{children}</main>
      {/* 필요 시 하단 Footer 등 추가 */}
    </div>
  );
};

export default AdminLayout;
