package com.hbs.hsbbo.admin.ai.brain.dto.model.request;

import lombok.*;

@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrainOptions {
    private String model;       // gpt-4o-mini 등
    private Double temperature; // 0.7
    private Double topP;        // 0.95
    private Integer maxTokens;  // 1024
    private String[] stop;      // stopJson에서 읽어온 배열
}
