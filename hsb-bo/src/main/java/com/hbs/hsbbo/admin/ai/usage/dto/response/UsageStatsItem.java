package com.hbs.hsbbo.admin.ai.usage.dto.response;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsageStatsItem {
    private String bucket;

    private LocalDate startDate;    // 버킷 시작일
    private LocalDate endDate;      // 버킷 종료일

    private Long totalCalls;        // 전체 호출 수
    private Long successCalls;      // 성공(Y) 호출 수
    private Long failCalls;         // 실패/에러 호출 수

    private Long totalPromptTokens;
    private Long totalCompletionTokens;
    private Long totalTokens;

    private Long avgLatencyMs;
}
