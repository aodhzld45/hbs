package com.hbs.hsbbo.admin.ai.brain.dto.request;

import lombok.*;

import java.util.Map;

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

    private String filePath;     // FILE
    private String sourceUrl;    // URL
    private String contentText;  // TEXT

    private String docType;      // FILE | URL | TEXT
    private String category;

    /**
     * source metadata
     */
    private String sourceTitle;
    private String originalFileName;
    private String mimeType;
    private String language;     // ko | en | auto
    private String parserType;   // openai | unstructured | custom

    /**
     * chunk / prompt
     */
    private Map<String, Object> chunkPolicy;
    private String summaryPrompt;
    private String tagPrompt;
    private String welcomePrompt;

    /**
     * 챗봇 연계용
     */
    private String chatType;     // knowledge | consulting
}
