import React, { useState, useEffect } from 'react';
import useUsageStats from './hooks/useUsageStats';
import FiltersBar from './components/FiltersBar';
import SummaryCard from './components/SummaryCard';
import UsageChart from './components/UsageChart';
import UsageTable from './components/UsageTable';
import TopQuestionsCard from './components/TopQuestionsCard';
import { fetchUsageStatsExcel, fetchTopQuestions } from './services/usageStatsApi';
import type { TopQuestionItem } from './services/usageStatsApi';
import { useCurrentPageTitle } from '../../Common/hooks/useCurrentPageTitle';
import AdminLayout from "../../../../components/Layout/AdminLayout";
import { useAuth } from "../../../../context/AuthContext";
import PageLoader from "../../../common/PageLoader";

export default function AdminUsageStats() {
  const [downloading, setDownloading] = useState(false);
  const [topQuestions, setTopQuestions] = useState<TopQuestionItem[]>([]);
  const [topQuestionsLoading, setTopQuestionsLoading] = useState(false);
  const [topQuestionsError, setTopQuestionsError] = useState<string | null>(null);

  const currentMenuTitle = useCurrentPageTitle();
  const { admin } = useAuth();
  const [adminId, setAdminId] = useState<string | null>(admin?.id || null);

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

  // 가장 많이 물어본 질문 TOP 20 (필터 기간/테넌트/사이트키 적용)
  const loadTopQuestions = React.useCallback(async () => {
    setTopQuestionsLoading(true);
    setTopQuestionsError(null);
    try {
      const list = await fetchTopQuestions({
        tenantId: filters.tenantId,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        siteKeyId: filters.siteKeyId,
      });
      setTopQuestions(list);
    } catch (e) {
      console.error(e);
      setTopQuestionsError('TOP 20 질문 조회에 실패했습니다.');
      setTopQuestions([]);
    } finally {
      setTopQuestionsLoading(false);
    }
  }, [filters.tenantId, filters.fromDate, filters.toDate, filters.siteKeyId]);

  useEffect(() => {
    loadTopQuestions();
  }, [loadTopQuestions]);

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

  if (loading) {
    return (
      <AdminLayout>
        <PageLoader />
      </AdminLayout>
    )
  }

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

      <div className="mb-6">
        <TopQuestionsCard
          items={topQuestions}
          loading={topQuestionsLoading}
          error={topQuestionsError}
        />
      </div>

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



