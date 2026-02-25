export type Status = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export type PromptProfile = {
  id: number;

  /* 이 프롬프트 설정을 연결할 SiteKey ID */
  linkedSiteKeyId?: number | null;

  tenantId?: string | null;
  name: string;
  purpose?: string | null;        // support/sales/faq/portfolio

  // 모델/파라미터
  model: string;
  temperature: number;
  topP?: number | null;
  maxTokens?: number | null;
  seed?: number | null;
  freqPenalty?: number | null;
  presencePenalty?: number | null;
  stopJson?: string | null;

  // 프롬프트 리소스
  systemTpl?: string | null;
  guardrailTpl?: string | null;

  welcomeBlocksJson?: string | null;
  styleJson?: string | null;
  toolsJson?: string | null;
  policiesJson?: string | null;

  // 상태/감사
  version: number;
  status: Status;

  useTf?: 'Y' | 'N';
  delTf?: 'Y' | 'N';
  regDate?: string;
  upDate?: string;

  /** 이 프로필에서 지문으로 사용할 KB 문서 ID 목록. BO가 조회해 knowledgeContext로 조합 후 Brain에 전달. */
  kbDocumentIds?: number[] | null;
};

// 등록/수정 공용 Request
export type PromptProfileRequest =
  Omit<PromptProfile, 'id'| 'regDate' | 'upDate'>

// 목록 응답
export interface PromptProfileListResponse {
  items: PromptProfile[];
  totalCount: number;
  totalPages: number;
}