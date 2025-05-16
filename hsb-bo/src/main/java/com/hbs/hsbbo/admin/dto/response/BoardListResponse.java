package com.hbs.hsbbo.admin.dto.response;


import lombok.*;

import java.util.List;

@AllArgsConstructor
@RequiredArgsConstructor
@Getter
@Setter
@ToString
public class BoardListResponse {
    private List<BoardResponse> items;
    private long totalCount;
    private int totalPages;
}
