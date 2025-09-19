package com.hbs.hsbbo.user.ai.dto;

import lombok.Data;

@Data
public class ChatRequest {
    private String system;      // 선택: 시스템 프롬프트
    private String context;     // 선택: KB/배경정보
    private String prompt;      // 필수: 사용자 프롬프트
    private String model;       // 선택: gpt-4o-mini 등 (미지정 시 기본)
    private Double temperature; // 선택: 기본 0.3
    private Integer maxTokens;  // 선택: 응답 길이 제한
}