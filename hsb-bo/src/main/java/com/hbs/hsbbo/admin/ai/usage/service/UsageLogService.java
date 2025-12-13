package com.hbs.hsbbo.admin.ai.usage.service;

import com.hbs.hsbbo.admin.ai.brain.dto.model.response.BrainUsage;
import com.hbs.hsbbo.admin.ai.brain.dto.request.BrainChatRequest;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainChatResponse;
import com.hbs.hsbbo.admin.ai.promptprofile.domain.entity.PromptProfile;
import com.hbs.hsbbo.admin.ai.sitekey.domain.entity.SiteKey;
import com.hbs.hsbbo.admin.ai.usage.domain.entity.UsageLog;
import com.hbs.hsbbo.admin.ai.usage.repository.UsageLogRepository;
import com.hbs.hsbbo.admin.ai.widgetconfig.domain.entity.WidgetConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UsageLogService {
    private final UsageLogRepository usageLogRepository;

    // Brain 호출 성공 케이스 로그 저장
    @Transactional
    public void logBrainChatSuccess(
            String tenantId,
            SiteKey siteKey,
            PromptProfile profile,
            WidgetConfig widgetConfig,
            String channel,
            String userPrompt,
            BrainChatRequest brainReq,
            BrainChatResponse brainRes,
            String clientHost,
            String userIp,
            String userAgent,
            Integer httpStatus,
            String quotaType,          // "SITE_KEY" or "IP" 등
            Integer quotaRemaining
    ) {
        BrainUsage usage = brainRes.getUsage();

        UsageLog log = UsageLog.builder()
                .tenantId(tenantId)
                .siteKey(siteKey)
                .siteKeyValue(siteKey.getSiteKey())
                .promptProfile(profile)
                .widgetConfig(widgetConfig)
                .conversationId(brainRes.getConversationId())
                .channel(channel)

                .requestText(truncate(userPrompt, 1000))
                .answerText(truncate(brainRes.getAnswer(), 1000))

                .model(usage != null ? usage.getModel() : null)
                .promptTokens(usage != null ? usage.getPromptTokens() : null)
                .completionTokens(usage != null ? usage.getCompletionTokens() : null)
                .totalTokens(usage != null ? usage.getTotalTokens() : null)
                .latencyMs(usage != null ? usage.getLatencyMs() : null)

                .userIp(userIp)
                .userAgent(truncate(userAgent, 255))
                .clientHost(truncate(clientHost, 255))

                .httpStatus(httpStatus != null ? httpStatus : 200)
                .successTf("Y")
                .errorCode(null)
                .errorMessage(null)
                .quotaType(quotaType)
                .quotaRemaining(quotaRemaining)

                .ragUsedTf("N")      // TODO: RAG 붙이면 Y로 세팅
                .ragSourceCount(null)
                .toolUsedTf("N")     // TODO: Tool/Agent 붙이면 Y로 세팅

                // AuditBase 필드는 기본값(Y/N) 그대로 사용
                .build();

        usageLogRepository.save(log);
    }

    private String truncate(String s, int max) {
        if (s == null) return null;
        if (s.length() <= max) return s;
        return s.substring(0, max);
    }

}
