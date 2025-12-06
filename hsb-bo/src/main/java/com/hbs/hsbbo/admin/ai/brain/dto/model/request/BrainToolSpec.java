package com.hbs.hsbbo.admin.ai.brain.dto.model.request;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrainToolSpec {
    private String name;               // "getStockPrice" 등
    private String description;        // 한 줄 설명
    private Map<String, Object> schema; // 파라미터 JSON 스키마 등 (유연하게)
}
