package com.hbs.hsbbo.admin.ai.brain.dto.response;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("ingestId")
    @JsonAlias("ingest_id")
    private String ingestId;

    // OpenAI Vector Store 결과 값 저장 키값 id (snake_case / camelCase 응답 모두 수용)
    @JsonProperty("vectorStoreId")
    @JsonAlias("vector_store_id")
    private String vectorStoreId;
    @JsonProperty("openaiFileId")
    @JsonAlias("openai_file_id")
    private String openaiFileId;
    @JsonProperty("vectorStoreFileId")
    @JsonAlias("vector_store_file_id")
    private String vectorStoreFileId;

    @JsonProperty("summaryText")
    @JsonAlias("summary_text")
    private String summaryText;
    @JsonProperty("rawPreview")
    @JsonAlias("raw_preview")
    private String rawPreview;
    private List<String> tags;
}
