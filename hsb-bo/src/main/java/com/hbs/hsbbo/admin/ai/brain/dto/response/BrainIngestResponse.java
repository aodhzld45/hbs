package com.hbs.hsbbo.admin.ai.brain.dto.response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrainIngestResponse {
    private boolean ok;
    private String message;
    private String ingestId;

    // OpenAI Vector Store 결과 값 저장 키값 id
    private String vectorStoreId;
    private String vectorFileId;

    private String summaryText;
    private String rawPreview;
}
