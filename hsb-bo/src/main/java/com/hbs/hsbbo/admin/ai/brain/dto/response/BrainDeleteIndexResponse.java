package com.hbs.hsbbo.admin.ai.brain.dto.response;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrainDeleteIndexResponse {
    private boolean ok;
    private String message;
    private String status;

    @JsonProperty("vectorStoreId")
    @JsonAlias("vector_store_id")
    private String vectorStoreId;

    @JsonProperty("vectorFileId")
    @JsonAlias({"vector_file_id", "vectorStoreFileId", "vector_store_file_id"})
    private String vectorFileId;

    @JsonProperty("openaiFileId")
    @JsonAlias("openai_file_id")
    private String openaiFileId;
}
