import { useCallback, useEffect, useState, useMemo } from "react";
import {
    UsageStatsItem,
    UsageStatsListResponse,
    Period
} from "../types/usageStats";

import {
    fetchUsageStats,
    UsageStatsQuery,
} from "../services/usageStatsApi";

// 필터 상태 타입
export interface UsageStatsFilterState {
    tenantId?: string;
    period: Period;
    fromDate?: string; // "YYYY-MM-DD"
    toDate?: string;   // "YYYY-MM-DD"
    siteKeyId?: number;
    channel?: string;
}

// 훅 리턴 타입
export interface UseUsageStatsResult {
    loading: boolean;
    error: string | null;
  
    items: UsageStatsItem[];
    totalCount: number;
    totalPages: number;
  
    page: number;
    size: number;
  
    filters: UsageStatsFilterState;
  
    setPage: (page: number) => void;
    setSize: (size: number) => void;
  
    // period / 날짜 / siteKey / channel 등 필터 일부만 변경
    updateFilters: (partial: Partial<UsageStatsFilterState>) => void;
  
    // period 변경 + 기본 날짜 범위 자동 세팅
    setPeriodWithDefaultRange: (period: Period) => void;
  
    // 강제 새로고침
    reload: () => void;
  }

// 오늘 날짜를 YYYY-MM-DD 문자열로
const formatDate = (d: Date): string => {
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${day}`;
};

// period에 따라 기본 from/to 설정
const defaultRangeForPeriod = (period: Period): {
    fromDate: string;
    toDate: string;
} => {
    const today = new Date();
  
    if (period === "DAILY") {
      const from = new Date(today);
      from.setDate(today.getDate() - 6); // 최근 7일
      return { fromDate: formatDate(from), toDate: formatDate(today) };
    }
  
    if (period === "WEEKLY") {
      const from = new Date(today);
      from.setDate(today.getDate() - 7 * 7); // 최근 7주 정도
      return { fromDate: formatDate(from), toDate: formatDate(today) };
    }
  
    // MONTHLY
    const from = new Date(today);
    from.setMonth(today.getMonth() - 6); // 최근 6개월
    return { fromDate: formatDate(from), toDate: formatDate(today) };
};

export function useUsageStats(
    initial?: Partial<{
      tenantId: string;
      period: Period;
      fromDate: string;
      toDate: string;
      siteKeyId: number;
      channel: string;
      page: number;
      size: number;
    }>
  ): UseUsageStatsResult {
    // 1) 초기 period / 날짜 범위 결정
    const initialPeriod: Period = initial?.period ?? "DAILY";
  
    const initialRange = useMemo(
      () => defaultRangeForPeriod(initialPeriod),
      [initialPeriod]
    );
  
    const [filters, setFilters] = useState<UsageStatsFilterState>({
      tenantId: initial?.tenantId ?? "tenant-hsbs",
      period: initialPeriod,
      fromDate: initial?.fromDate ?? initialRange.fromDate,
      toDate: initial?.toDate ?? initialRange.toDate,
      siteKeyId: initial?.siteKeyId,
      channel: initial?.channel,
    });
  
    const [page, setPage] = useState<number>(initial?.page ?? 0);
    const [size, setSize] = useState<number>(initial?.size ?? 20);
  
    const [items, setItems] = useState<UsageStatsItem[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
  
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
  
    // 실제 API 호출 함수
    const load = useCallback(
      async (override?: Partial<{ page: number; size: number; filters: UsageStatsFilterState }>) => {
        setLoading(true);
        setError(null);
  
        const effectiveFilters = override?.filters ?? filters;
        const effectivePage = override?.page ?? page;
        const effectiveSize = override?.size ?? size;
  
        const query: UsageStatsQuery = {
          tenantId: effectiveFilters.tenantId,
          period: effectiveFilters.period,
          fromDate: effectiveFilters.fromDate,
          toDate: effectiveFilters.toDate,
          siteKeyId: effectiveFilters.siteKeyId,
          channel: effectiveFilters.channel,
          page: effectivePage,
          size: effectiveSize,
        };
  
        try {
          const res: UsageStatsListResponse = await fetchUsageStats(query);
          setItems(res.items ?? []);
          setTotalCount(res.totalCount ?? 0);
          setTotalPages(res.totalPages ?? 0);
        } catch (e: any) {
          console.error("[useUsageStats] fetch error", e);
          setError(e?.message ?? "사용 통계 조회 중 오류가 발생했습니다.");
        } finally {
          setLoading(false);
        }
      },
      [filters, page, size]
    );
  
    // 최초 & 필터/페이지 변경 시 자동 로드
    useEffect(() => {
      load();
    }, [load]);
  
    // 필터 일부만 변경 (page는 0으로 초기화)
    const updateFilters = useCallback((partial: Partial<UsageStatsFilterState>) => {
      setFilters((prev) => ({
        ...prev,
        ...partial,
      }));
      setPage(0);
    }, []);
  
    // period 변경 시 기본 날짜 범위도 같이 리셋
    const setPeriodWithDefaultRange = useCallback((period: Period) => {
      const range = defaultRangeForPeriod(period);
      setFilters((prev) => ({
        ...prev,
        period,
        fromDate: range.fromDate,
        toDate: range.toDate,
      }));
      setPage(0);
    }, []);
  
    // 강제 새로고침
    const reload = useCallback(() => {
      load({ page, size, filters });
    }, [load, page, size, filters]);
  
    return {
      loading,
      error,
      items,
      totalCount,
      totalPages,
      page,
      size,
      filters,
      setPage,
      setSize,
      updateFilters,
      setPeriodWithDefaultRange,
      reload,
    };
  }

  export default useUsageStats;







