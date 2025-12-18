import React from "react";
import { UsageStatsItem, Period } from "../types/usageStats";
import Pagination from "../../../../../components/Common/Pagination";

type Props = {
  items: UsageStatsItem[];
  period: Period;
  loading?: boolean;
  error?: string | null;

  page: number;          // 0-based
  size: number;
  totalCount: number;
  totalPages: number;

  onPageChange: (page: number) => void;
  onSizeChange?: (size: number) => void;
};

const UsageTable: React.FC<Props> = ({
  items,
  period,
  loading = false,
  error,
  page,
  size,
  totalCount,
  totalPages,
  onPageChange,
  onSizeChange,
}) => {
  const periodLabel =
    period === "DAILY" ? "일별"
    : period === "WEEKLY" ? "주별"
    : "월별";

  const formatNumber = (n: number | null | undefined) =>
    (n ?? 0).toLocaleString();

  const formatMs = (n: number | null | undefined) =>
    (n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 1 });

  const formatDateRange = (item: UsageStatsItem) => {
    if (!item.startDate && !item.endDate) return "-";

    // startDate / endDate 를 string (YYYY-MM-DD) 로 가정
    if (item.startDate === item.endDate) {
      return item.startDate ?? "-";
    }
    return `${item.startDate ?? "-"} ~ ${item.endDate ?? "-"}`;
  };

  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">
          {periodLabel} 사용 상세
        </h2>

        <div className="text-xs text-gray-500">
          전체 {totalCount.toLocaleString()}개 버킷 / 페이지{" "}
          {totalPages === 0 ? 0 : page + 1} / {totalPages}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
            <div className="text-[11px] text-gray-500">
                총 {totalCount.toLocaleString()}개 버킷
            </div>

            <div className="flex items-center gap-3">
            {onSizeChange && (
                <select
                className="rounded border border-gray-300 px-1 py-0.5 text-[11px]"
                value={size}
                onChange={(e) => onSizeChange(Number(e.target.value))}
                >
                {[10, 20, 50, 100].map((s) => (
                    <option key={s} value={s}>
                    {s}개씩
                    </option>
                ))}
                </select>
            )}
            </div>
      </div>
      </div>

      {error && (
        <div className="mb-2 rounded bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead>
            <tr className="border-b bg-gray-50 text-[11px] uppercase text-gray-500">
              <th className="px-3 py-2">버킷</th>
              <th className="px-3 py-2">기간</th>
              <th className="px-3 py-2 text-right">총 호출</th>
              <th className="px-3 py-2 text-right">성공</th>
              <th className="px-3 py-2 text-right">실패</th>
              <th className="px-3 py-2 text-right">성공률</th>
              <th className="px-3 py-2 text-right">평균 응답(ms)</th>
              <th className="px-3 py-2 text-right">입력 토큰</th>
              <th className="px-3 py-2 text-right">출력 토큰</th>
              <th className="px-3 py-2 text-right">총 토큰</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={10}
                  className="px-3 py-6 text-center text-xs text-gray-500"
                >
                  데이터를 불러오는 중입니다...
                </td>
              </tr>
            )}

            {!loading && items.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  className="px-3 py-6 text-center text-xs text-gray-400"
                >
                  조회된 데이터가 없습니다.
                </td>
              </tr>
            )}

            {!loading &&
              items.map((it, idx) => {
                const totalCalls = it.totalCalls ?? 0;
                const successCalls = it.successCalls ?? 0;
                const failCalls = it.failCalls ?? 0;
                const successRate =
                  totalCalls > 0 ? (successCalls / totalCalls) * 100 : 0;

                return (
                  <tr
                    key={`${it.bucketLabel}-${idx}`}
                    className="border-b last:border-0 hover:bg-gray-50/60"
                  >
                    {/* 버킷 라벨 (YYYY-MM-DD / YYYY-Www / YYYY-MM 등) */}
                    <td className="px-3 py-2 align-middle text-[11px] font-medium text-gray-800">
                      {it.bucketLabel}
                    </td>

                    {/* 기간 (start ~ end) */}
                    <td className="px-3 py-2 align-middle text-[11px] text-gray-600">
                      {formatDateRange(it)}
                    </td>

                    {/* 총 호출 */}
                    <td className="px-3 py-2 text-right align-middle text-[11px]">
                      {formatNumber(totalCalls)}
                    </td>

                    {/* 성공 */}
                    <td className="px-3 py-2 text-right align-middle text-[11px] text-emerald-700">
                      {formatNumber(successCalls)}
                    </td>

                    {/* 실패 */}
                    <td className="px-3 py-2 text-right align-middle text-[11px] text-red-600">
                      {formatNumber(failCalls)}
                    </td>

                    {/* 성공률 */}
                    <td className="px-3 py-2 text-right align-middle text-[11px]">
                      {successRate.toFixed(1)}%
                    </td>

                    {/* 평균 응답(ms) */}
                    <td className="px-3 py-2 text-right align-middle text-[11px]">
                      {formatMs(it.avgLatencyMs)}
                    </td>

                    {/* 입력 토큰 */}
                    <td className="px-3 py-2 text-right align-middle text-[11px]">
                      {formatNumber(it.totalPromptTokens)}
                    </td>

                    {/* 출력 토큰 */}
                    <td className="px-3 py-2 text-right align-middle text-[11px]">
                      {formatNumber(it.totalCompletionTokens)}
                    </td>

                    {/* 총 토큰 */}
                    <td className="px-3 py-2 text-right align-middle text-[11px]">
                      {formatNumber(it.totalTokens)}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* 하단 페이징 영역 */}
      <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
    </div>
  );
};

export default UsageTable;
