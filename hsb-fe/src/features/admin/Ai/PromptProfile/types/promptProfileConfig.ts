export type PromptStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export type PromptProfile = {
  id: number;

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
  styleJson?: string | null;
  toolsJson?: string | null;
  policiesJson?: string | null;

  // 상태/감사
  version: number;
  promptStatus: PromptStatus;

  useTf?: 'Y' | 'N';
  delTf?: 'Y' | 'N';
  regDate?: string;
  upDate?: string;
};

// 등록/수정 공용 Request
export type PromptProfileRequest =
  Omit<PromptProfile, 'id' | 'useTf' | 'delTf' | 'regDate' | 'upDate'>

// 목록 응답
export interface PromptProfileListResponse {
  items: PromptProfile[];
  totalCount: number;
  totalPages: number;
}