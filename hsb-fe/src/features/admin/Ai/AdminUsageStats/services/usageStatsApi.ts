// services/usageStatsApi.ts

import api, { okOrThrow } from "../../../../../services/api";
import {
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

const buildParams = (query: UsageStatsQuery) => {
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

  const params: Record<string, any> = { period, page, size };
  if (tenantId) params.tenantId = tenantId;
  if (fromDate) params.fromDate = fromDate;
  if (toDate) params.toDate = toDate;
  if (siteKeyId != null) params.siteKeyId = siteKeyId;
  if (channel) params.channel = channel;
  return params;
};

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
  const params = buildParams(query);
  return okOrThrow(api.get<UsageStatsListResponse>(BASE, { params }));
};

// 엑셀 다운로드 
export const fetchUsageStatsExcel = async (
  query: UsageStatsQuery,
  options?: { filename?: string }
): Promise<void> => {
  const params = buildParams(query);

  const res = await api.get(`${BASE}/export.xlsx`, {
    params,
    responseType: "blob",
  });

  const period = (params.period ?? "DAILY").toLowerCase();
  const page = params.page ?? 0;
  const size = params.size ?? 20;

  const defaultName =
    options?.filename ??
    `usage_stats_${period}_p${page}_s${size}.xlsx`;

  const blob = new Blob([res.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  downloadBlob(blob, defaultName);
}

// Blob 다운로드 유틸 
const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};



