/**
 * 관리자 로그 단건
 * - 조회 결과 1건에 해당하는 shape
 */
export interface AdminLogItem {
    id: number;
    adminId: string;
    action: string;
    detail: string;
    url: string;
    params: string;
    ip: string;
    logDate: string;
}
  
/**
 * 관리자 로그 목록 조회 파라미터
 * - /api/admin-logs GET query parameters
 */
export interface AdminLogSearchParams {
    keyword?: string;
    page: number;
    size: number;
    start?: string;
    end?: string;
}

/**
 * 관리자 로그 목록 조회 응답
 * - pagination info + list
 */
export interface AdminLogListResponse {
    items: AdminLogItem[];
    totalCount: number;
    totalPages: number;
}
  