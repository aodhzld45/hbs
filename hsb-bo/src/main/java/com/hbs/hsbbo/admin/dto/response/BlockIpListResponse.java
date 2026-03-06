package com.hbs.hsbbo.admin.dto.response;

import lombok.*;

import java.util.List;

@AllArgsConstructor
@RequiredArgsConstructor
@Getter
@Setter
@Builder
@ToString
public class BlockIpListResponse {
    private List<BlockIpResponse> items;
    private Long totalCount;
    private int totalPages;

    public static BlockIpListResponse of(List<BlockIpResponse> items, long totalCount, int totalPages) {
        return BlockIpListResponse.builder()
                .items(items)
                .totalCount(totalCount)
                .totalPages(totalPages)
                .build();
    }
}
