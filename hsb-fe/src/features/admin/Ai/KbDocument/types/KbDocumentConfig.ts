/** KbDocument Response DTO 매핑 */
export interface KbDocumentResponse {
    id: number;
    kbSourceId: number;
    title: string;
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

    regAdm: string;
    regDate: string; // ISO 8601 형식의 문자열 (LocalDateTime 대응)
    upAdm: string;
    upDate: string;
    delAdm: string | null; // 삭제되지 않은 경우 null 가능성 고려
    delDate: string | null;
}

// 등록 / 수정 공용 Request
export type KbDocumentRequest =
  Omit<KbDocumentResponse, 'id' | 'regDate' | 'upDate'>


// 목록 + 필터 페이징 포함 응답
export interface KbDocumentListResponse {
    items: KbDocumentResponse[];
    totalCount: number;
    totalPages: number;
  }
