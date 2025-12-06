package com.hbs.hsbbo.admin.ai.brain.dto.model.request;

import lombok.*;

@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrainMeta {
    private String userIp;
    private String userAgent;
    private String locale;    // ko-KR 등
    private String channel;   // widget / internal 등
}
