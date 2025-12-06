package com.hbs.hsbbo.admin.ai.brain.dto.model.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrainSafety {
    private Boolean blocked;
    private List<String> reasons;  // "PII", "violence" 등
}
