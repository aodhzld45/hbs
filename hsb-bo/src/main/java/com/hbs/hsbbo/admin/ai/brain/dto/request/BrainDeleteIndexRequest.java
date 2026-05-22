package com.hbs.hsbbo.admin.ai.brain.dto.request;

import lombok.*;

@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrainDeleteIndexRequest {
    private Long kbJobId;
    private Long kbDocumentId;
    private Long kbSourceId;

    private String vectorStoreId;
    private String vectorFileId;
    private String openaiFileId;
}
