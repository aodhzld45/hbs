export type Yn = 'Y' | 'N';

export interface BlockIp {
  id: number;
  ipAddress: string;
  description?: string | null;

  useTf: Yn;
  delTf: Yn;

  regAdm?: string | null;
  regDate?: string | null;
  upAdm?: string | null;
  upDate?: string | null;
  delAdm?: string | null;
  delDate?: string | null;
}

export interface BlockIpRequest {
  ipAddress: string;
  description?: string;
}

export interface BlockIpListResponse {
  items: BlockIp[];
  totalCount: number;
  totalPages: number;
}
