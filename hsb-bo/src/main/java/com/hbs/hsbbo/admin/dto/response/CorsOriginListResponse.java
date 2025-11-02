package com.hbs.hsbbo.admin.dto.response;

import lombok.*;

import java.util.List;

@AllArgsConstructor
@RequiredArgsConstructor
@Getter
@Setter
@Builder
@ToString
public class CorsOriginListResponse {
    private List<CorsOriginResponse> items;
    private Long totalCount;
    private int totalPages;

    public static CorsOriginListResponse of(List<CorsOriginResponse> items, long totalCount, int totalPages) {
        return CorsOriginListResponse.builder()
                .items(items)
                .totalCount(totalCount)
                .totalPages(totalPages)
                .build();
    }
}
