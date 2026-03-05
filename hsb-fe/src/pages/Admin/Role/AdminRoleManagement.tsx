import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../../../components/Layout/AdminLayout';
import RoleGroupList from '../../../components/Admin/Role/RoleGroupList';
import RoleMenuMapping from '../../../components/Admin/Role/RoleMenuMapping';
import UserRoleAssignment from '../../../components/Admin/Role/UserRoleAssignment';
import Toast, { ToastState, ToastType } from '../../../components/Admin/Role/Toast';
import { fetchRoleGroups } from '../../../services/Admin/roleApi';
import { RoleGroup } from '../../../types/Admin/RoleGroup';

const AdminAuthManagement: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = (searchParams.get('tab') as 'ROLE' | 'MENU' | 'USER') || 'ROLE';
  const [activeTab, setActiveTab] = useState<'ROLE' | 'MENU' | 'USER'>(defaultTab);

  const [roles, setRoles] = useState<RoleGroup[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ show: true, message, type });
  }, []);

  const closeToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  const loadRoles = useCallback(async () => {
    setRolesLoading(true);
    try {
      const data = await fetchRoleGroups();
      setRoles(data);
    } catch (err) {
      console.error('권한 그룹 목록 불러오기 실패:', err);
      showToast('권한 그룹 목록을 불러오지 못했습니다.', 'error');
    } finally {
      setRolesLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  return (
    <AdminLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">관리자 권한 관리</h2>

        <div className="flex border-b mb-6 space-x-4">
          {[
            { key: 'ROLE', label: '권한 그룹 관리' },
            { key: 'MENU', label: '메뉴 권한 매핑' },
            { key: 'USER', label: '사용자 권한 지정' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'ROLE' | 'MENU' | 'USER')}
              className={`px-4 py-2 font-semibold ${
                activeTab === tab.key
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div>
          {activeTab === 'ROLE' && (
            <RoleGroupList
              roles={roles}
              loading={rolesLoading}
              onRefresh={loadRoles}
              showToast={showToast}
            />
          )}
          {activeTab === 'MENU' && (
            <RoleMenuMapping roles={roles} rolesLoading={rolesLoading} showToast={showToast} />
          )}
          {activeTab === 'USER' && (
            <UserRoleAssignment roles={roles} rolesLoading={rolesLoading} showToast={showToast} />
          )}
        </div>
      </div>

      <Toast state={toast} onClose={closeToast} />
    </AdminLayout>
  );
};

export default AdminAuthManagement;
