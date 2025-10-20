package com.hbs.hsbbo.admin.ai.widgetconfig.dto.response;


import lombok.*;

import java.util.List;

@AllArgsConstructor
@RequiredArgsConstructor
@Getter
@Setter
@Builder
@ToString
public class WidgetConfigListResponse {
    private List<WidgetConfigResponse> items;
    private long totalCount;
    private int totalPages;

    public static WidgetConfigListResponse of(List<WidgetConfigResponse> items, long totalCount, int totalPages) {
        return WidgetConfigListResponse.builder()
                .items(items)
                .totalCount(totalCount)
                .totalPages(totalPages)
                .build();
    }
}
