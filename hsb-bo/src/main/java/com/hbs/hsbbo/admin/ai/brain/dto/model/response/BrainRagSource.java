package com.hbs.hsbbo.admin.ai.brain.dto.model.response;

import lombok.*;

@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrainRagSource {
    private String docId;
    private String title;
    private Double score;
    private String url;
}
