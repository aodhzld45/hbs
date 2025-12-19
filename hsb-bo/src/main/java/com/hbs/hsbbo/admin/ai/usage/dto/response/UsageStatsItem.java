package com.hbs.hsbbo.admin.ai.usage.dto.response;

import com.hbs.hsbbo.admin.ai.usage.domain.type.Period;
import com.hbs.hsbbo.admin.ai.usage.dto.UsageStatsProjection;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsageStatsItem {
    private String bucketLabel;         // YYYY-MM-DD / YYYY-Www / YYYY-MM 같은 라벨
    private LocalDate bucketDate;       // 그룹 기준일(정렬/식별용) - Projection의 bucketDate 매핑

    private LocalDate startDate;        // 버킷 시작일
    private LocalDate endDate;          // 버킷 종료일

    private Long totalCalls;            // 전체 호출 수
    private Long successCalls;          // 성공(Y) 호출 수
    private Long failCalls;             // 실패/에러 호출 수

    private Long totalPromptTokens;
    private Long totalCompletionTokens;
    private Long totalTokens;           // 합계 토큰 수 (null → 0 처리)

    private Double avgLatencyMs;        // 평균 latency (ms) – 소수점 허용

    // 파생값(화면/리포트에 바로 쓰기)
    private Double successRate;         // 0~100 (%)

    private Double avgTokensPerCall;    // 호출당 평균 토큰

    public static UsageStatsItem from(UsageStatsProjection p, Period period) {
        LocalDate bucketDate = p.getBucketDate();

        LocalDate start;
        LocalDate end;

        // period 기준으로 버킷 시작/종료일 계산
        switch (period) {
            case DAILY -> {
                start = bucketDate;
                end = bucketDate;
            }
            case WEEKLY -> {
                // bucketDate 자체가 "주 시작일(월요일)"로 내려오도록 쿼리에서 만들었으니 그대로 사용
                start = bucketDate;
                end = bucketDate.plusDays(6);
            }
            case MONTHLY -> {
                start = bucketDate.withDayOfMonth(1);
                end = bucketDate.withDayOfMonth(bucketDate.lengthOfMonth());
            }
            default -> {
                start = bucketDate;
                end = bucketDate;
            }
        }

        long total = nvl(p.getTotalCalls());
        long success = nvl(p.getSuccessCalls());
        long fail = nvl(p.getFailCalls());

        long prompt = nvl(p.getTotalPromptTokens());
        long completion = nvl(p.getTotalCompletionTokens());
        long tokens = nvl(p.getTotalTokens());

        double successRate = (total == 0) ? 0.0 : round2(success * 100.0 / total);
        double avgTokens = (total == 0) ? 0.0 : round2(tokens * 1.0 / total);

        return UsageStatsItem.builder()
                .bucketLabel(p.getBucketLabel())
                .bucketDate(bucketDate)
                .startDate(start)
                .endDate(end)

                .totalCalls(total)
                .successCalls(success)
                .failCalls(fail)

                .totalPromptTokens(prompt)
                .totalCompletionTokens(completion)
                .totalTokens(tokens)

                .avgLatencyMs(nvlD(p.getAvgLatencyMs()))

                .successRate(successRate)
                .avgTokensPerCall(avgTokens)
                .build();
    }

    // =======================
    // Null-safe helpers
    // =======================
    private static long nvl(Long v) { return v == null ? 0L : v; }
    private static double nvlD(Double v) { return v == null ? 0.0 : v; }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

}
