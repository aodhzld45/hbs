package com.hbs.hsbbo.admin.ai.brain.dto.model.request;

import lombok.*;

import java.util.List;

@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrainRagOptions {
    private Boolean enabled;       // true/false
    private List<String> docIds;   // 특정 문서로 한정하고 싶을 때
    private Integer topK;          // 몇 개 가져올지
}
