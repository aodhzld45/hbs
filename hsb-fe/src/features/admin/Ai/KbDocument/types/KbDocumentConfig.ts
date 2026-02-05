/** KbDocument Response DTO 매핑 */
export interface KbDocumentResponse {
    id: number;
    kbSourceId: number;
    title: string;
    vectorStoreId: string | null; // https://api.openai.com/v1/vector_stores/{vector_store_id}/search와 매핑
    vectorFileId: string | null;
    indexedAt: string | null;
    indexError: string | null;
    indexSummary: string | null;
    docType: string;
    docStatus: string;
    version: number;
    filePath: string;
    originalFileName: string;
    fileSize: number;
    fileHash: string;
    mimeType: string;
    sourceUrl: string;
    category: string;
    tagsJson: string;

    useTf?: 'Y' | 'N';
    delTf?: 'Y' | 'N';
    regAdm: string;
    regDate: string; // ISO 8601 형식의 문자열 (LocalDateTime 대응)
    upAdm: string;
    upDate: string;
    delAdm: string | null; // 삭제되지 않은 경우 null 가능성 고려
    delDate: string | null;
}

// 등록 / 수정 공용 Request
export type KbDocumentRequest = {
  kbSourceId: number;
  title: string;

  docType: string;      // 예: "FILE" | "URL" | "TEXT"
  docStatus: string;    // 예: "DRAFT" | "READY" | "INDEXED" | "FAILED"

  sourceUrl?: string;   // URL 타입일 때 사용
  category?: string;
  tagsJson?: string;    // 기본 "[]"

  useTf?: "Y" | "N";
  delTf?: "Y" | "N";
};

// 목록 + 필터 페이징 포함 응답
export interface KbDocumentListResponse {
    items: KbDocumentResponse[];
    totalCount: number;
    totalPages: number;
  }
