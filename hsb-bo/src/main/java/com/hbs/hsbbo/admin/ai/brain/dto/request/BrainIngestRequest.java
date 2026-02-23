package com.hbs.hsbbo.admin.ai.brain.dto.request;

import lombok.*;

@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrainIngestRequest {
    private Long kbJobId;
    private Long kbDocumentId;
    private Long kbSourceId;

    private String vectorStoreId;

    private String filePath;   // 서버 로컬 파일 경로(/home/upload/..)
    private String sourceUrl;  // URL 문서면
    private String docType;    // FILE/URL/TEXT
    private String category;

    /** 요약 생성용 LLM 지시문. 비우면 Brain 기본 prompt 사용 */
    private String summaryPrompt;

}
