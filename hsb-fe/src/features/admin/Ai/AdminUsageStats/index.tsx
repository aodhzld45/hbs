import React, { useMemo, useState, useEffect } from 'react';
import useUsageStats from './hooks/useUsageStats';
import FiltersBar, {SiteKeyOption} from './components/FiltersBar';
import SummaryCard from './components/SummaryCard';
import UsageChart from './components/UsageChart';
import UsageTable from './components/UsageTable';

// 공통 메뉴 목록 불러오기
import {
  fetchAdminMenus
} from '../../../../services/Admin/adminMenuApi';
import { AdminMenu } from '../../../../types/Admin/AdminMenu';
import { useLocation, useSearchParams } from "react-router-dom";

// 관리자 정보 불러오기
import AdminLayout from "../../../../components/Layout/AdminLayout";
import { useAuth } from "../../../../context/AuthContext";

export default function AdminUsageStats() {
    // 공통 헤더/메뉴 관련
    const location = useLocation();
    const { admin } = useAuth();
    const [adminId, setAdminId] = useState<string | null>(admin?.id || null);
    const [menus, setMenus] = useState<(AdminMenu & { label?: string })[]>([]);
    const [currentMenuTitle, setCurrentMenuTitle] = useState<string | null>(null);
    const [menuLoading, setMenuLoading] = useState(true);
    const [menuError, setMenuError] = useState<string>("");
    // ===== 메뉴 로딩 =====
    const loadMenus = async () => {
        try {
        const data = await fetchAdminMenus();
        setMenus(data);
        const matched = data.find((m) => m.url === location.pathname);
        setCurrentMenuTitle(matched ? matched.name : null);
        } catch (e) {
        console.error(e);
        setMenuError("메뉴 목록을 불러오는데 실패했습니다.");
        } finally {
        setMenuLoading(false);
        }
    };
  
    useEffect(() => {
    loadMenus();
    }, [location.pathname]);
  
    useEffect(() => {
    setAdminId(admin?.id || null);
    }, [admin?.id]);


  const {
    loading,
    error,
    items,
    filters,
    setPeriodWithDefaultRange,
    updateFilters,
    reload,
    page,
    size,
    setPage,
    setSize,
    totalCount,
    totalPages,
  } = useUsageStats();


  return (
    <AdminLayout>
    <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">
      {currentMenuTitle}
    </h2>

      <FiltersBar
        filters={filters}
        onChangePeriod={setPeriodWithDefaultRange}
        onChangeFilters={updateFilters}
        onSearch={reload}
        loading={loading}
      />
      <SummaryCard
        items={items}
        period={filters.period}
        loading={loading}
        error={error}
       /> 
      <UsageChart
        items={items}
        period={filters.period}
        loading={loading}
      />
      <UsageTable
          items={items}
          period={filters.period}
          loading={loading}
          error={error}
          page={page}
          size={size}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={setPage}
          onSizeChange={setSize}
        />

   
    </div>    
    </AdminLayout>
  );
};



