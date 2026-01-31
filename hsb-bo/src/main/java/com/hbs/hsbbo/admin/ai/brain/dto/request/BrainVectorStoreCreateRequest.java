package com.hbs.hsbbo.admin.ai.brain.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrainVectorStoreCreateRequest {
    private String name; // 예: "hsbs-kbsource-12"
}
