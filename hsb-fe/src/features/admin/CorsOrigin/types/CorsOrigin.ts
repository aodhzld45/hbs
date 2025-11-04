export type Yn = 'Y' | 'N';

export interface CorsOrigin {
  id: number;
  originPat: string;
  description?: string | null;
  tenantId?: string | null;

  useTf: Yn;
  delTf: Yn;

  regAdm?: string | null;
  regDate?: string | null;
  upAdm?: string | null;
  upDate?: string | null;
}

export interface CorsOriginRequest {
  originPat?: string;       // 생성 시 필수, 수정 시 선택(정책)
  description?: string;
  tenantId?: string | null;
}

export interface CorsOriginListResponse {
  items: CorsOrigin[];
  totalCount: number;
  totalPages: number;
}



