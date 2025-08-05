// src/components/Layout/AdminLayout.tsx
import React, { useState } from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <AdminHeader toggleSidebar={toggleSidebar} />

      {/* 본문: 사이드바 + 콘텐츠 */}
      <div className="flex flex-1 relative">
        {/* 사이드바 */}
        <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        {/* 오버레이 처리 */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* 본문 */}
        <main className="flex-1 p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
