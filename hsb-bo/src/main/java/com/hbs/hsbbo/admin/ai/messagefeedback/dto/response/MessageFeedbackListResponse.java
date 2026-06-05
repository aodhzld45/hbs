package com.hbs.hsbbo.admin.ai.messagefeedback.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class MessageFeedbackListResponse {
    private List<MessageFeedbackResponse> items;
    private long totalCount;
    private int totalPages;

    public static MessageFeedbackListResponse of(
            List<MessageFeedbackResponse> items,
            long totalCount,
            int totalPages
    ) {
        return MessageFeedbackListResponse.builder()
                .items(items)
                .totalCount(totalCount)
                .totalPages(totalPages)
                .build();
    }
}
