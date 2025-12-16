import React, { useEffect, useState, useMemo } from 'react';
import { Period } from "../types/usageStats"
import { UsageStatsFilterState } from '../hooks/useUsageStats'

import { fetchSiteKeyList, fetchLinkedSiteKeys } from '../../AdminSiteKeys/services/siteKeyApi'; 
import type { SiteKeySummary } from '../../AdminSiteKeys/types/siteKey';

export type SiteKeyOption = {
    id: number;
    name: string;
    siteKey: string;
};

type Props = {
    filters: UsageStatsFilterState;
    onChangePeriod: (period: Period) => void;
    onChangeFilters: (partial: Partial<UsageStatsFilterState>) => void;
    onSearch: () => void;
    siteKeys?: SiteKeyOption[];
    loading?: boolean;
};
  
const periodLabels: Record<Period, string> = {
    DAILY: "일별",
    WEEKLY: "주별",
    MONTHLY: "월별",
};

const FiltersBar: React.FC<Props> = ({
    filters,
    onChangePeriod,
    onChangeFilters,
    onSearch,
    loading = false,
  }) => {

    // 사이트키 목록 상태
    const [siteKeys, setSiteKeys] = useState<SiteKeySummary[]>([]);
    const [loadingKeys, setLoadingKeys] = useState(false);
    const [keysError, setKeysError] = useState<string | null>(null);

    // 사이트키 목록 로드 (ACTIVE 위주)
    useEffect(() => {
        (async () => {
            try {
            setLoadingKeys(true);
            setKeysError(null);
            const res = await fetchSiteKeyList({
                keyword: '',
                planCode: '',
                status: 'ACTIVE',
                page: 0,
                size: 200,
                sort: 'regDate,desc',
            });
            setSiteKeys(res.content ?? []);
            } catch (e: any) {
            setKeysError(e?.message ?? '사이트키 조회 실패');
            } finally {
            setLoadingKeys(false);
            }
        })();
        }, []);

    // Select 라벨 가독성 향상
    const siteKeyOptions = useMemo(
        () =>
        siteKeys.map((k) => ({
            value: k.id,
            label: `[${k.id}] ${k.siteKey} (${k.planCode ?? '-'}, ${k.status}${
            k.useTf === 'Y' ? '' : ', off'
            })`,
            disabled: k.status !== 'ACTIVE',
        })),
        [siteKeys]
    );


    const handlePeriodClick = (p: Period) => {
      if (p === filters.period) return;
      onChangePeriod(p);
    };
  
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target; // name = "fromDate" | "toDate"
      onChangeFilters({ [name]: value });
    };
  
    const handleSiteKeyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const v = e.target.value;
      onChangeFilters({
        siteKeyId: v === "" ? undefined : Number(v),
      });
    };
  
    const handleChannelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const v = e.target.value;
      onChangeFilters({
        channel: v === "" ? undefined : v,
      });
    };

return (
    <div className="mb-4 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
        {/* 1. 기간(일/주/월) 토글 */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="mr-2 text-sm font-medium text-gray-700">기간 단위</span>
        {(["DAILY", "WEEKLY", "MONTHLY"] as Period[]).map((p) => {
            const active = filters.period === p;
            return (
            <button
                key={p}
                type="button"
                onClick={() => handlePeriodClick(p)}
                className={
                "rounded-full px-3 py-1 text-xs font-medium border " +
                (active
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100")
                }
            >
                {periodLabels[p]}
            </button>
            );
        })}
        </div>

        {/* 2. 날짜 범위 + siteKey + channel */}
        <div className="flex flex-wrap items-end gap-3">
        {/* 날짜 범위 */}
        <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
            시작일
            </label>
            <input
            type="date"
            name="fromDate"
            value={filters.fromDate ?? ""}
            onChange={handleDateChange}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
            />
        </div>

        <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">
            종료일
            </label>
            <input
            type="date"
            name="toDate"
            value={filters.toDate ?? ""}
            onChange={handleDateChange}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
            />
        </div>

        {/* SiteKey 셀렉트 */}
        <div className="flex flex-col min-w-[180px]">
            <label className="text-xs font-medium text-gray-600 mb-1">
            사이트키
            </label>

            <select
            value={filters.siteKeyId ?? ""}
            onChange={handleSiteKeyChange}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
            >
            <option value="">(선택 없음)</option>
            {siteKeyOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
            </select>
        </div>

        {/* Channel 셀렉트 */}
        <div className="flex flex-col min-w-[140px]">
            <label className="text-xs font-medium text-gray-600 mb-1">
            채널
            </label>
            <select
            value={filters.channel ?? ""}
            onChange={handleChannelChange}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
            >
            <option value="">전체</option>
            <option value="widget">widget</option>
            <option value="admin">admin</option>
            <option value="api">api</option>
            </select>
        </div>

        {/* 검색 버튼 */}
        <div className="ml-auto flex items-end">
            <button
            type="button"
            onClick={onSearch}
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
            {loading ? "조회 중..." : "조회"}
            </button>
        </div>
        </div>
    </div>
    );
};

export default FiltersBar;




