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

    private String filePath;   // 서버 로컬 파일 경로(/home/upload/..)
    private String sourceUrl;  // URL 문서면
    private String docType;    // FILE/URL/TEXT
    private String category;

}
