package com.hbs.hsbbo.user.ai.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatResponse {
    private String model;
    private String text;
    private Integer inputTokens;
    private Integer outputTokens;
    private Integer totalTokens;
}
