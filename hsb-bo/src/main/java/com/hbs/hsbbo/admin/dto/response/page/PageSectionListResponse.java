package com.hbs.hsbbo.admin.dto.response.page;

import lombok.*;

import java.util.List;

@AllArgsConstructor
@RequiredArgsConstructor
@Getter
@Setter
@ToString
public class PageSectionListResponse {
    private List<PageSectionResponse> items;
    private long totalCount;
    private int totalPages;
}
