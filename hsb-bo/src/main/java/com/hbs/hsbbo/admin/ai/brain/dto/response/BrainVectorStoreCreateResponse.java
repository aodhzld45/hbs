package com.hbs.hsbbo.admin.ai.brain.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrainVectorStoreCreateResponse {
    private String vectorStoreId; // "vs_..."
}
