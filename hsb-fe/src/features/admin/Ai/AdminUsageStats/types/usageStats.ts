// 일/주/월 구분
export type Period = 'DAILY' | 'WEEKLY' | 'MONTHLY';

// 서버 DTO UsageStatsItem 매핑
export interface UsageStatsItem {
    bucketLabel: string;   // "2025-12-13", "2025-W50", "2025-12" 등
    bucketDate: string;    // 그룹 기준일(정렬/식별용) - Projection의 bucketDate 매핑

    startDate: string;     // YYYY-MM-DD (백엔드 LocalDate 직렬화)
    endDate: string;       // YYYY-MM-DD
  
    totalCalls: number;
    successCalls: number;
    failCalls: number;
  
    totalPromptTokens: number;
    totalCompletionTokens: number;
    totalTokens: number;
  
    avgLatencyMs: number;
    successRate: number;
    avgTokensPerCall: number;
}

// 목록 응답
export interface UsageStatsListResponse {
    items: UsageStatsItem[];
    totalCount: number;
    totalPages: number;
}

