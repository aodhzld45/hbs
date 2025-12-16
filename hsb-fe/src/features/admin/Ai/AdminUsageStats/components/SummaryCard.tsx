import React from "react";
import {
  UsageStatsItem,
  Period,
} from "../types/usageStats";

type Props = {
  items: UsageStatsItem[];
  period: Period;
  loading?: boolean;
  error?: string | null;
};

const SummaryCard: React.FC<Props> = ({ items, period, loading = false, error }) => {
  // 합계/평균 계산
  const totalCalls = items.reduce((sum, it) => sum + (it.totalCalls ?? 0), 0);
  const successCalls = items.reduce((sum, it) => sum + (it.successCalls ?? 0), 0);
  const failCalls = items.reduce((sum, it) => sum + (it.failCalls ?? 0), 0);

  const totalPromptTokens = items.reduce(
    (sum, it) => sum + (it.totalPromptTokens ?? 0),
    0
  );
  const totalCompletionTokens = items.reduce(
    (sum, it) => sum + (it.totalCompletionTokens ?? 0),
    0
  );
  const totalTokens = items.reduce(
    (sum, it) => sum + (it.totalTokens ?? 0),
    0
  );

  const successRate =
    totalCalls > 0 ? (successCalls / totalCalls) * 100 : 0;

  // 가중 평균 latency (버킷별 평균 * 호출 수)
  const weightedLatencySum = items.reduce((sum, it) => {
    const calls = it.totalCalls ?? 0;
    const lat = it.avgLatencyMs ?? 0;
    return sum + calls * lat;
  }, 0);
  const avgLatencyMs =
    totalCalls > 0 ? weightedLatencySum / totalCalls : 0;

  const periodLabel =
    period === "DAILY" ? "일별"
    : period === "WEEKLY" ? "주별"
    : "월별";

  const formatNumber = (n: number) =>
    n.toLocaleString(undefined, { maximumFractionDigits: 0 });

  const formatMs = (ms: number) =>
    ms.toLocaleString(undefined, { maximumFractionDigits: 1 });

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">
          {periodLabel} 사용 요약
        </h2>
        {loading && (
          <span className="text-xs text-gray-500">
            로딩 중...
          </span>
        )}
        {error && !loading && (
          <span className="text-xs text-red-500">
            {error}
          </span>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-4 sm:grid-cols-2">
        {/* 총 호출 수 */}
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
          <div className="text-xs font-medium text-gray-500">
            총 호출 수
          </div>
          <div className="mt-1 text-xl font-bold text-gray-900">
            {formatNumber(totalCalls)}
          </div>
          <div className="mt-1 text-[11px] text-gray-500">
            성공 {formatNumber(successCalls)} / 실패 {formatNumber(failCalls)}
          </div>
        </div>

        {/* 성공률 */}
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
          <div className="text-xs font-medium text-gray-500">
            성공률
          </div>
          <div className="mt-1 text-xl font-bold text-gray-900">
            {successRate.toFixed(1)}%
          </div>
          <div className="mt-1 text-[11px] text-gray-500">
            (성공 호출 / 전체 호출 기준)
          </div>
        </div>

        {/* 평균 응답 시간 */}
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
          <div className="text-xs font-medium text-gray-500">
            평균 응답 시간
          </div>
          <div className="mt-1 text-xl font-bold text-gray-900">
            {formatMs(avgLatencyMs)} ms
          </div>
          <div className="mt-1 text-[11px] text-gray-500">
            호출 수 가중 평균
          </div>
        </div>

        {/* 토큰 사용량 */}
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
          <div className="text-xs font-medium text-gray-500">
            총 토큰 사용량
          </div>
          <div className="mt-1 text-xl font-bold text-gray-900">
            {formatNumber(totalTokens)}
          </div>
          <div className="mt-1 text-[11px] text-gray-500">
            입력 {formatNumber(totalPromptTokens)} / 출력{" "}
            {formatNumber(totalCompletionTokens)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
