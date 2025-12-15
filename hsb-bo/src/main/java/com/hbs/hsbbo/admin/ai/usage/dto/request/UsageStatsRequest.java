package com.hbs.hsbbo.admin.ai.usage.dto.request;

import com.hbs.hsbbo.admin.ai.usage.domain.type.Period;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsageStatsRequest {
    private String tenantId;        // 선택: "hsbs" 기본
    private Period period;          // DAY / WEEK / MONTH

    private LocalDate fromDate;     // 시작일 (포함)
    private LocalDate toDate;       // 종료일 (포함)

    private Long siteKeyId;         // 선택: 특정 사이트키만 보고 싶을 때
    private String channel;

    private int page;
    private int size;

}
