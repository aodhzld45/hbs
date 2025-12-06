package com.hbs.hsbbo.admin.ai.brain.dto.model.response;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrainToolCallResult {
    private String toolName;
    private Map<String, Object> arguments;     // 호출 파라미터
    private String resultSummary;              // 요약
}
