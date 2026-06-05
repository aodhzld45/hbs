package com.hbs.hsbbo.admin.ai.messagefeedback.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MessageFeedbackSummaryResponse {
    private long totalCount;
    private long likeCount;
    private long dislikeCount;
    private double dislikeRate;
    private long recent24hDislikeCount;
}
