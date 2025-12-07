package com.hbs.hsbbo.admin.ai.brain.controller;

import com.hbs.hsbbo.admin.ai.brain.client.BrainClient;
import com.hbs.hsbbo.admin.ai.brain.dto.model.request.BrainMessage;
import com.hbs.hsbbo.admin.ai.brain.dto.model.request.BrainMeta;
import com.hbs.hsbbo.admin.ai.brain.dto.model.request.BrainOptions;
import com.hbs.hsbbo.admin.ai.brain.dto.request.BrainChatRequest;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainChatResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ai/brain-test")
@RequiredArgsConstructor
public class AiBrainTestController {
    private final BrainClient brainClient;

    /**
     * 간단한 Brain v1 연동 테스트용 엔드포인트
     * 예:
     *  POST /api/ai/brain-test?q=안녕 브레인
     */
    @PostMapping
    public BrainChatResponse testBrain(
            @RequestParam(name = "q", defaultValue = "안녕 브레인?") String q,
            HttpServletRequest servletRequest
    ) {
        // 1) user 메시지 1개 생성
        BrainMessage userMsg = BrainMessage.builder()
                .role("user")
                .content(q)
                .build();

        // 2) LLM 옵션 (필요 시 PromptProfile 값으로 교체)
        BrainOptions options = BrainOptions.builder()
                .model("gpt-4o-mini")   // 일단 하드코딩, 나중에 PromptProfile에서 가져오기
                .temperature(0.7)
                .build();

        // 3) 메타 정보 (로그용)
        BrainMeta meta = BrainMeta.builder()
                .userIp(servletRequest.getRemoteAddr())
                .userAgent(servletRequest.getHeader("User-Agent"))
                .channel("admin-test")
                .build();

        // 4) BrainChatRequest 조립
        BrainChatRequest brainReq = BrainChatRequest.builder()
                .tenantId("hsbs")          // TODO: 실제 tenantId로 교체
                .siteKey("SK_TEST")        // TODO: 실제 ai_site_key 값으로 교체
                .promptProfileId(1L)       // TODO: 실제 프로필 ID로 교체
                .widgetConfigId(1L)        // TODO: 실제 위젯 설정 ID로 교체
                .messages(List.of(userMsg))
                .options(options)
                .meta(meta)
                .build();

        // 5) FastAPI Brain 서버 호출
        return brainClient.chat(brainReq);
    }
}
