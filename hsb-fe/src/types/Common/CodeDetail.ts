export interface CodeDetail {
  id: number;
  codeId: string;
  codeGroupId: number;
  parentCodeId: string | null;
  codeNameKo: string;
  codeNameEn: string;
  orderSeq?: number;
  useTf: string;

  level?: number;
  label?: string;
}