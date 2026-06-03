package com.hbs.hsbbo.admin.ai.messagefeedback.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MessageFeedbackRequest {

    @Size(max = 100)
    private String siteKey;

    private Long usageLogId;

    @Size(max = 100)
    private String conversationId;

    @NotBlank(message = "messageId는 필수입니다.")
    @Size(max = 100)
    private String messageId;

    @Size(max = 1000)
    private String questionText;

    @Size(max = 1000)
    private String answerText;

    @NotBlank(message = "feedbackType은 필수입니다.")
    @Size(max = 20)
    private String feedbackType;

    @Size(max = 500)
    private String feedbackReason;
}
