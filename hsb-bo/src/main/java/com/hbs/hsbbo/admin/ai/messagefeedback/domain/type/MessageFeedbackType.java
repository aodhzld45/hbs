package com.hbs.hsbbo.admin.ai.messagefeedback.domain.type;

import com.hbs.hsbbo.common.exception.CommonException.BadRequestException;

import java.util.Locale;

public enum MessageFeedbackType {
    LIKE,
    DISLIKE;

    public static MessageFeedbackType parse(String value) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException("feedbackType은 필수입니다.");
        }
        try {
            return MessageFeedbackType.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("feedbackType은 LIKE 또는 DISLIKE만 가능합니다.");
        }
    }
}
