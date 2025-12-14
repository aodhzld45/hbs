package com.hbs.hsbbo.admin.ai.usage.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsageStatsListResponse {
    private List<UsageStatsItem> items;
    private long totalCount; // 버킷 개수
    private int totalPages;

    public static UsageStatsListResponse of(List<UsageStatsItem> items, long totalCount, int totalPages) {
        return UsageStatsListResponse.builder()
                .items(items)
                .totalCount(totalCount)
                .totalPages(totalPages)
                .build();
    }
}
