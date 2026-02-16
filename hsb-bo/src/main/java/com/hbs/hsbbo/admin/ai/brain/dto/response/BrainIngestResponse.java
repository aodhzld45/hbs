package com.hbs.hsbbo.admin.ai.brain.dto.response;

import lombok.*;

import java.util.List;

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
    private String openaiFileId;
    private String vectorStoreFileId;

    private String summaryText;
    private String rawPreview;
    private List<String> tags;
}
