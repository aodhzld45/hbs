export type ConstraintRule = 'SELECT_ONLY' | 'DML_ALLOWED'; // ← 백엔드 enum과 1:1

export interface ProblemItem {
  id: number;
  title: string;
  level?: number | null;
  tags?: string[] | null;
  descriptionMd?: string | null;
  constraintRule?: ConstraintRule | null;
  orderSensitive?: boolean;
  useTf?: 'Y' | 'N';
  delTf?: 'Y' | 'N';
  regAdm?: string | null;
  regDate?: string | null;
  upAdm?: string | null;
  upDate?: string | null;
  delAdm?: string | null;
  delDate?: string | null;
}

export interface ProblemListResponse {
  items: ProblemItem[];
  totalCount: number;
  totalPages: number;
}