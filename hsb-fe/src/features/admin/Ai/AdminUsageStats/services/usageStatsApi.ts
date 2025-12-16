// services/usageStatsApi.ts

import api, { okOrThrow } from "../../../../../services/api";
import {
  UsageStatsItem,
  UsageStatsListResponse,
  Period,
} from "../types/usageStats";

const BASE = "/ai/usage-stats";

export interface UsageStatsQuery {
  tenantId?: string;
  period?: Period; // 기본 DAILY

  fromDate?: string; // "YYYY-MM-DD"
  toDate?: string;   // "YYYY-MM-DD"

  siteKeyId?: number;
  channel?: string;  // "widget" | "admin" 등

  page?: number;     // 0-base
  size?: number;     // page size
}

/**
 * AI 사용 통계 조회 (일/주/월)
 * 예)
 *  fetchUsageStats({
 *    period: "DAILY",
 *    fromDate: "2025-12-01",
 *    toDate: "2025-12-13",
 *    page: 0,
 *    size: 20,
 *  })
 */
export const fetchUsageStats = async (
  query: UsageStatsQuery
): Promise<UsageStatsListResponse> => {
  const {
    tenantId,
    period = "DAILY",
    fromDate,
    toDate,
    siteKeyId,
    channel,
    page = 0,
    size = 20,
  } = query;

  const params: Record<string, any> = {
    period,
    page,
    size,
  };

  if (tenantId) params.tenantId = tenantId;
  if (fromDate) params.fromDate = fromDate;
  if (toDate) params.toDate = toDate;
  if (siteKeyId != null) params.siteKeyId = siteKeyId;
  if (channel) params.channel = channel;

  return okOrThrow(api.get<UsageStatsListResponse>(BASE, { params }));
};
