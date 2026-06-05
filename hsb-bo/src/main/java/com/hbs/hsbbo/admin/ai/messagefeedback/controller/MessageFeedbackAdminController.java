package com.hbs.hsbbo.admin.ai.messagefeedback.controller;

import com.hbs.hsbbo.admin.ai.messagefeedback.dto.request.MessageFeedbackQuery;
import com.hbs.hsbbo.admin.ai.messagefeedback.dto.response.MessageFeedbackListResponse;
import com.hbs.hsbbo.admin.ai.messagefeedback.dto.response.MessageFeedbackSummaryResponse;
import com.hbs.hsbbo.admin.ai.messagefeedback.dto.response.MessageFeedbackTopQuestionResponse;
import com.hbs.hsbbo.admin.ai.messagefeedback.service.MessageFeedbackAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/ai/message-feedback")
public class MessageFeedbackAdminController {

    private final MessageFeedbackAdminService service;

    @GetMapping
    public MessageFeedbackListResponse search(
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long siteKeyId,
            @RequestParam(required = false) String feedbackType,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String clientHost,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(defaultValue = "regDate,desc") String sort
    ) {
        return service.search(buildQuery(
                tenantId, fromDate, toDate, siteKeyId, feedbackType, keyword, clientHost, page, size, sort
        ));
    }

    @GetMapping("/summary")
    public MessageFeedbackSummaryResponse summary(
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long siteKeyId,
            @RequestParam(required = false) String feedbackType,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String clientHost
    ) {
        return service.summary(buildQuery(
                tenantId, fromDate, toDate, siteKeyId, feedbackType, keyword, clientHost, 0, 20, "regDate,desc"
        ));
    }

    @GetMapping("/top-disliked")
    public List<MessageFeedbackTopQuestionResponse> topDisliked(
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long siteKeyId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String clientHost
    ) {
        return service.topDisliked(buildQuery(
                tenantId, fromDate, toDate, siteKeyId, null, keyword, clientHost, 0, 10, "regDate,desc"
        ));
    }

    private MessageFeedbackQuery buildQuery(
            String tenantId,
            LocalDate fromDate,
            LocalDate toDate,
            Long siteKeyId,
            String feedbackType,
            String keyword,
            String clientHost,
            Integer page,
            Integer size,
            String sort
    ) {
        return MessageFeedbackQuery.builder()
                .tenantId(tenantId)
                .fromDate(fromDate)
                .toDate(toDate)
                .siteKeyId(siteKeyId)
                .feedbackType(feedbackType)
                .keyword(keyword)
                .clientHost(clientHost)
                .page(page)
                .size(size)
                .sort(sort)
                .build();
    }
}
