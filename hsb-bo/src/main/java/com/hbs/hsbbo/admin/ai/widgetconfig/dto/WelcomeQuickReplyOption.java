package com.hbs.hsbbo.admin.ai.widgetconfig.dto;

import lombok.Data;

@Data
public class WelcomeQuickReplyOption {
    private String label;       // 버튼 라벨
    private String payload;     // 전송될 질문 문장
    private Integer order;      // 정렬용 (옵션)

    private String id;          // 추후 통계용 등 (옵션)
    private String payloadType; // "TEXT" 등 (옵션)
    private String trackKey;    // 추적용 키 (옵션)
}