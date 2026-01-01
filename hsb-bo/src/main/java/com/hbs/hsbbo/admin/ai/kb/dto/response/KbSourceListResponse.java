package com.hbs.hsbbo.admin.ai.kb.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KbSourceListResponse {

    private List<KbSourceResponse> items;
    private long totalCount;
    private int totalPages;

    public static KbSourceListResponse of(List<KbSourceResponse> items, long totalCount, int totalPages) {
        return KbSourceListResponse.builder()
                .items(items)
                .totalCount(totalCount)
                .totalPages(totalPages)
                .build();
    }
}
