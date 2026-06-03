package com.hbs.hsbbo.admin.ai.messagefeedback.controller;

import com.hbs.hsbbo.admin.ai.messagefeedback.dto.request.MessageFeedbackRequest;
import com.hbs.hsbbo.admin.ai.messagefeedback.dto.response.MessageFeedbackResponse;
import com.hbs.hsbbo.admin.ai.messagefeedback.service.MessageFeedbackService;
import com.hbs.hsbbo.common.util.ClientIpUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/ai/public/message-feedback")
@RequiredArgsConstructor
public class MessageFeedbackPublicController {

    private final MessageFeedbackService messageFeedbackService;

    @PostMapping
    @CrossOrigin(origins = "*", allowedHeaders = { "Content-Type", "Authorization", "X-HSBS-Site-Key" })
    public ResponseEntity<MessageFeedbackResponse> submit(
            @RequestHeader(value = "X-HSBS-Site-Key", required = false) String siteKeyHeader,
            @Valid @RequestBody MessageFeedbackRequest req,
            HttpServletRequest http
    ) {
        MessageFeedbackResponse response = messageFeedbackService.submitPublicFeedback(
                siteKeyHeader,
                extractClientHost(http),
                ClientIpUtil.extractClientIp(http),
                http.getHeader("User-Agent"),
                req
        );

        return ResponseEntity
                .created(URI.create("/api/ai/public/message-feedback/" + response.getId()))
                .body(response);
    }

    private String extractClientHost(HttpServletRequest http) {
        String host = hostOrNull(http.getHeader("Origin"));
        return host != null ? host : hostOrNull(http.getHeader("Referer"));
    }

    private String hostOrNull(String url) {
        if (url == null || url.isBlank()) {
            return null;
        }
        try {
            return new URI(url).getHost();
        } catch (Exception e) {
            return null;
        }
    }
}
