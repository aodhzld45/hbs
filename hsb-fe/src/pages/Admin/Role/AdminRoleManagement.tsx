// src/pages/admin/authority/AdminAuthManagement.tsx

import React, { useState } from 'react';
import AdminLayout from '../../../components/Layout/AdminLayout';
import RoleGroupList from '../../../components/Admin/Role/RoleGroupList';
import RoleMenuMapping from '../../../components/Admin/Role/RoleMenuMapping';
import UserRoleAssignment from '../../../components/Admin/Role/UserRoleAssignment';

const AdminAuthManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ROLE' | 'MENU' | 'USER'>('ROLE');

  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">관리자 권한 관리</h2>

        {/* 탭 메뉴 */}
        <div className="flex border-b mb-6 space-x-4">
          {[
            { key: 'ROLE', label: '권한 그룹 관리' },
            { key: 'MENU', label: '메뉴 권한 매핑' },
            { key: 'USER', label: '사용자 권한 지정' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'ROLE' | 'MENU' | 'USER')}
              className={`px-4 py-2 font-semibold ${
                activeTab === tab.key ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 탭별 컴포넌트 */}
        <div>
          {activeTab === 'ROLE' && <RoleGroupList />}
          {activeTab === 'MENU' && <RoleMenuMapping />}
          {activeTab === 'USER' && <UserRoleAssignment />}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAuthManagement;
