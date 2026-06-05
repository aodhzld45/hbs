package com.hbs.hsbbo.admin.ai.messagefeedback.dto.request;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class MessageFeedbackQuery {
    private String tenantId;
    private LocalDate fromDate;
    private LocalDate toDate;
    private Long siteKeyId;
    private String feedbackType;
    private String keyword;
    private String clientHost;
    private Integer page;
    private Integer size;
    private String sort;
}
