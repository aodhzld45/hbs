import React, { useState, useEffect } from 'react';
import useUsageStats from './hooks/useUsageStats';
import FiltersBar from './components/FiltersBar';
import SummaryCard from './components/SummaryCard';
import UsageChart from './components/UsageChart';
import UsageTable from './components/UsageTable';
import { fetchUsageStatsExcel } from './services/usageStatsApi';

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
  const [downloading, setDownloading] = useState(false);

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

  const onPrint = () => {
    window.print();
  }

  const handleExcelDownload = async () => {
    try {
      setDownloading(true);
      await fetchUsageStatsExcel(
        {
          tenantId: filters.tenantId,
          period: filters.period,
          fromDate: filters.fromDate,
          toDate: filters.toDate,
          siteKeyId: filters.siteKeyId ? Number(filters.siteKeyId) : undefined,
          channel: filters.channel || undefined,
          page,
          size,
        },
        {
          filename: `usage_stats_${filters.period}_p${page}_s${size}.xlsx`,
        }
      ); 
    } catch (error) {
      console.error(error);
      alert("엑셀 다운로드에 실패했습니다.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AdminLayout>
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        {currentMenuTitle}
      </h2>

      <div className="no-print flex items-center justify-end gap-2 mb-3">
        <button
          onClick={handleExcelDownload}
          disabled={loading || downloading}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {downloading ? "다운로드 중..." : "엑셀 다운로드"}
        </button>

        <button
          onClick={onPrint}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          PDF 출력
        </button>
      </div>

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



