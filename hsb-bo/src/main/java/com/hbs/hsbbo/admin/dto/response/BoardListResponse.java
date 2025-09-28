package com.hbs.hsbbo.admin.dto.response;


import lombok.*;

import java.util.List;

@AllArgsConstructor
@RequiredArgsConstructor
@Builder
@Getter
@Setter
@ToString
public class BoardListResponse {
    private List<BoardResponse> items;
    private List<BoardResponse> notices;
    private long totalCount;
    private int totalPages;
}
