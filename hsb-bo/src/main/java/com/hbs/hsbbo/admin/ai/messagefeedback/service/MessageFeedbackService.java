package com.hbs.hsbbo.admin.ai.messagefeedback.service;

import com.hbs.hsbbo.admin.ai.messagefeedback.domain.entity.MessageFeedback;
import com.hbs.hsbbo.admin.ai.messagefeedback.domain.type.MessageFeedbackType;
import com.hbs.hsbbo.admin.ai.messagefeedback.dto.request.MessageFeedbackRequest;
import com.hbs.hsbbo.admin.ai.messagefeedback.dto.response.MessageFeedbackResponse;
import com.hbs.hsbbo.admin.ai.messagefeedback.repository.MessageFeedbackRepository;
import com.hbs.hsbbo.admin.ai.sitekey.domain.entity.SiteKey;
import com.hbs.hsbbo.admin.ai.sitekey.service.SiteKeyService;
import com.hbs.hsbbo.admin.ai.usage.domain.entity.UsageLog;
import com.hbs.hsbbo.admin.ai.usage.repository.UsageLogRepository;
import com.hbs.hsbbo.common.exception.CommonException.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class MessageFeedbackService {

    private final MessageFeedbackRepository messageFeedbackRepository;
    private final UsageLogRepository usageLogRepository;
    private final SiteKeyService siteKeyService;

    @Transactional
    public MessageFeedbackResponse submitPublicFeedback(
            String siteKey,
            String clientHost,
            String userIp,
            String userAgent,
            MessageFeedbackRequest req
    ) {
        String key = normalizeSiteKey(firstNonBlank(siteKey, req.getSiteKey()));
        if (key == null) {
            throw new BadRequestException("사이트키는 필수입니다.");
        }

        SiteKey siteKeyEntity = siteKeyService.assertActiveAndDomainAllowed(key, clientHost);
        MessageFeedbackType feedbackType = MessageFeedbackType.parse(req.getFeedbackType());
        UsageLog usageLog = resolveUsageLog(req.getUsageLogId(), siteKeyEntity);

        MessageFeedback feedback = messageFeedbackRepository
                .findActiveBySiteKeyAndMessageId(siteKeyEntity.getSiteKey(), req.getMessageId().trim())
                .orElseGet(MessageFeedback::new);

        boolean isNew = feedback.getId() == null;
        LocalDateTime now = LocalDateTime.now();

        feedback.setTenantId(resolveTenantId(siteKeyEntity, usageLog));
        feedback.setSiteKey(siteKeyEntity);
        feedback.setSiteKeyValue(siteKeyEntity.getSiteKey());
        feedback.setUsageLog(usageLog);
        feedback.setConversationId(trim(req.getConversationId()));
        feedback.setMessageId(req.getMessageId().trim());
        feedback.setQuestionText(truncate(trim(req.getQuestionText()), 1000));
        feedback.setAnswerText(truncate(trim(req.getAnswerText()), 1000));
        feedback.setFeedbackType(feedbackType);
        feedback.setFeedbackReason(truncate(trim(req.getFeedbackReason()), 500));
        feedback.setClientHost(truncate(clientHost, 255));
        feedback.setUserIp(truncate(userIp, 45));
        feedback.setUserAgent(truncate(userAgent, 255));

        if (isNew) {
            feedback.setRegAdm("PUBLIC_WIDGET");
        } else {
            feedback.setUpAdm("PUBLIC_WIDGET");
            feedback.setUpDate(now);
        }

        return MessageFeedbackResponse.from(messageFeedbackRepository.save(feedback));
    }

    private UsageLog resolveUsageLog(Long usageLogId, SiteKey siteKey) {
        if (usageLogId == null) {
            return null;
        }

        UsageLog usageLog = usageLogRepository.findActiveById(usageLogId)
                .orElseThrow(() -> new BadRequestException("사용 로그를 찾을 수 없습니다."));

        if (usageLog.getSiteKey() != null && !usageLog.getSiteKey().getId().equals(siteKey.getId())) {
            throw new BadRequestException("사용 로그와 사이트키가 일치하지 않습니다.");
        }
        if (usageLog.getSiteKeyValue() != null && !usageLog.getSiteKeyValue().equalsIgnoreCase(siteKey.getSiteKey())) {
            throw new BadRequestException("사용 로그와 사이트키가 일치하지 않습니다.");
        }

        return usageLog;
    }

    private String resolveTenantId(SiteKey siteKey, UsageLog usageLog) {
        if (usageLog != null && usageLog.getTenantId() != null && !usageLog.getTenantId().isBlank()) {
            return usageLog.getTenantId();
        }
        return "hsbs";
    }

    private String normalizeSiteKey(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim().toUpperCase(Locale.ROOT);
    }

    private String firstNonBlank(String a, String b) {
        if (a != null && !a.isBlank()) return a;
        if (b != null && !b.isBlank()) return b;
        return null;
    }

    private String trim(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String truncate(String value, int max) {
        if (value == null || value.length() <= max) {
            return value;
        }
        return value.substring(0, max);
    }
}
