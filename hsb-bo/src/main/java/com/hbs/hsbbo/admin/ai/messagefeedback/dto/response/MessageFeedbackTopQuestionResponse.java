package com.hbs.hsbbo.admin.ai.messagefeedback.dto.response;

import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class MessageFeedbackTopQuestionResponse {
    private final String questionText;
    private final String answerText;
    private final long dislikeCount;
    private final LocalDateTime lastFeedbackAt;

    public MessageFeedbackTopQuestionResponse(
            String questionText,
            String answerText,
            long dislikeCount,
            LocalDateTime lastFeedbackAt
    ) {
        this.questionText = questionText == null || questionText.isBlank() ? "(질문 없음)" : questionText;
        this.answerText = answerText;
        this.dislikeCount = dislikeCount;
        this.lastFeedbackAt = lastFeedbackAt;
    }
}
