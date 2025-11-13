package com.hbs.hsbbo.admin.ai.promptprofile.dto.response;

import lombok.*;

import java.util.List;

@AllArgsConstructor
@RequiredArgsConstructor
@Getter
@Setter
@Builder
@ToString
public class PromptProfileListResponse {
    private List<PromptProfileResponse> items;
    private long totalCount;
    private int totalPages;

    public static PromptProfileListResponse of(List<PromptProfileResponse> items, long totalCount, int totalPages) {
        return PromptProfileListResponse.builder()
                .items(items)
                .totalCount(totalCount)
                .totalPages(totalPages)
                .build();
    }


}
