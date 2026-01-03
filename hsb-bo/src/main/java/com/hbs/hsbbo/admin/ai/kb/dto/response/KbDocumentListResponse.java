package com.hbs.hsbbo.admin.ai.kb.dto.response;

import lombok.*;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Getter
@Setter
@Slf4j
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KbDocumentListResponse {

    private List<KbDocumentResponse> items;
    private long totalCount;
    private int totalPages;

    public static KbDocumentListResponse of(List<KbDocumentResponse> items, long totalCount, int totalPage) {
        return KbDocumentListResponse.builder()
                .items(items)
                .totalCount(totalCount)
                .totalPages(totalPage)
                .build();
    }

}
