package com.hbs.hsbbo.admin.ai.kb.dto.response;

import lombok.*;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KbSourceListResponse {

    private List<KbSourceResponse> items;
    private long totalCount;
    private int totalPages;

    public static KbSourceListResponse of(Page<?> page, List<KbSourceResponse> items) {
        return KbSourceListResponse.builder()
                .items(items)
                .totalCount(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }
}
