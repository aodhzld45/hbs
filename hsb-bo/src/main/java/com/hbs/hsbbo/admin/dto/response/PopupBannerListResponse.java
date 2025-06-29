package com.hbs.hsbbo.admin.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@ToString
@AllArgsConstructor
@RequiredArgsConstructor
public class PopupBannerListResponse {
    private List<PopupBannerResponse> items;
    private long totalCount;
    private int totalPages;

}
