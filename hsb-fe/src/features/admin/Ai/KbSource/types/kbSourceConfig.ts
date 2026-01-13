/** KbSource Response DTO 매핑 */
export interface KbSourceResponse {
  id: number;
  siteKeyId: number;

  sourceName: string;
  description?: string | null;

  useTf?: 'Y' | 'N';
  delTf?: 'Y' | 'N';

  regDate?: string | null;
  upDate?: string | null;
}

// 등록/수정 공용 Request
export type KbSourceRequest =
  Omit<KbSourceResponse, 'id' | 'regDate' | 'upDate'>

// 목록 응답
export interface KbSourceListResponse {
  items: KbSourceResponse[];
  totalCount: number;
  totalPages: number;
}



