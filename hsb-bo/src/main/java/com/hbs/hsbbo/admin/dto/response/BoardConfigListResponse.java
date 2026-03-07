package com.hbs.hsbbo.admin.dto.response;

import lombok.*;

import java.util.List;

@AllArgsConstructor
@RequiredArgsConstructor
@Builder
@Getter
@Setter
@ToString
public class BoardConfigListResponse {
    private List<BoardConfigResponse> items;
    private long totalCount;
    private int totalPages;
}
