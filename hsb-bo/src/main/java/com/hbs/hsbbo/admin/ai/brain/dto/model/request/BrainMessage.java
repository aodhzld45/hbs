package com.hbs.hsbbo.admin.ai.brain.dto.model.request;


import lombok.*;

import java.util.Map;

@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrainMessage {
    private String role;          // "system" | "user" | "assistant" 등
    private String content;       // 실제 텍스트
    private Map<String, Object> meta;  // 선택: 메시지별 메타(툴 호출 로그 등)
}
