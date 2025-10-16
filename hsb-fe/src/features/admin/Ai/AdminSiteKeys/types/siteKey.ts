export type Status = "ACTIVE" | "SUSPENDED" | "REVOKED";

export type SiteKeySummary = {
  id: number;
  siteKey: string;
  status: Status;
  planCode?: string | null;
  dailyCallLimit?: number | null;
  dailyTokenLimit?: number | null;
  domainCount: number;
  regDate?: string | null;
  useTf?: string | null;
  upDate?: string | null;
};

export type SiteKeyResponse = {
  id: number;
  siteKey: string;
  status: Status;
  planCode?: string | null;
  dailyCallLimit?: number | null;
  dailyTokenLimit?: number | null;
  monthlyTokenLimit?: number | null;
  rateLimitRps?: number | null;
  allowedDomains: string[];
  defaultWidgetConfigId?: number | null;
  defaultPromptProfileId?: number | null;
  notes?: string | null;
  regDate?: string | null;
  useTf?: string | null;
  upDate?: string | null;
};

export type PagedResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type CreateRequest = {
  siteKey: string;
  status?: Status;
  planCode?: string | null;
  dailyCallLimit?: number | null;
  dailyTokenLimit?: number | null;
  monthlyTokenLimit?: number | null;
  rateLimitRps?: number | null;
  allowedDomains: string[];
  defaultWidgetConfigId?: number | null;
  defaultPromptProfileId?: number | null;
  notes?: string | null;
};

export type UpdateRequest = Omit<CreateRequest, "siteKey">;

export type StatusRequest = { status: Status; notes?: string | null };

export type ListQuery = {
  keyword?: string;
  planCode?: string;
  status?: Status | "";
  page?: number;
  size?: number;
  sort?: string; // "regDate,desc"
};

export type ApiError = { code: string; message: string };
