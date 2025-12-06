package com.hbs.hsbbo.admin.ai.brain.dto.model.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrainRagResult {
    private Boolean used;
    private List<BrainRagSource> sources;
}
