package com.hbs.hsbbo.admin.ai.brain.dto.response;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrainHealthResponse {
    private boolean ok;
    private String status;
    private String service;
    private String version;
    private String message;
    private Map<String, Object> details;
}
