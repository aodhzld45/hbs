package com.hbs.hsbbo.admin.ai.messagefeedback.dto.response;

import com.hbs.hsbbo.admin.ai.messagefeedback.domain.entity.MessageFeedback;
import com.hbs.hsbbo.admin.ai.messagefeedback.domain.type.MessageFeedbackType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MessageFeedbackResponse {
    private Long id;
    private String tenantId;
    private Long siteKeyId;
    private String siteKey;
    private Long usageLogId;
    private String conversationId;
    private String messageId;
    private String questionText;
    private String answerText;
    private MessageFeedbackType feedbackType;
    private String feedbackReason;
    private String clientHost;
    private LocalDateTime regDate;
    private LocalDateTime upDate;

    public static MessageFeedbackResponse from(MessageFeedback e) {
        return MessageFeedbackResponse.builder()
                .id(e.getId())
                .tenantId(e.getTenantId())
                .siteKeyId(e.getSiteKey() == null ? null : e.getSiteKey().getId())
                .siteKey(e.getSiteKeyValue())
                .usageLogId(e.getUsageLog() == null ? null : e.getUsageLog().getId())
                .conversationId(e.getConversationId())
                .messageId(e.getMessageId())
                .questionText(e.getQuestionText())
                .answerText(e.getAnswerText())
                .feedbackType(e.getFeedbackType())
                .feedbackReason(e.getFeedbackReason())
                .clientHost(e.getClientHost())
                .regDate(e.getRegDate())
                .upDate(e.getUpDate())
                .build();
    }
}
