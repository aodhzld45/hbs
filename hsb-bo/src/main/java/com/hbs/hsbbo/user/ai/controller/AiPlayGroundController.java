package com.hbs.hsbbo.user.ai.controller;

import com.hbs.hsbbo.user.ai.dto.ChatRequest;
import com.hbs.hsbbo.user.ai.dto.ChatResponse;
import com.hbs.hsbbo.user.ai.service.OpenAiService;
import com.hbs.hsbbo.user.ai.support.DailyQuotaSupport;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiPlayGroundController {
    private final OpenAiService openAiService;
    private final DailyQuotaSupport dailyQuotaSupport;

    @PostMapping("/complete")
    public ResponseEntity<ChatResponse> complete(
            @RequestBody ChatRequest req,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletRequest http) {

        if (req.getPrompt() == null || req.getPrompt().isBlank()) {
            throw new IllegalArgumentException("prompt is required");
        }

        // 식별자(IP) 추출
        String ip = Optional.ofNullable(http.getHeader("X-Forwarded-For"))
                .map(v -> v.split(",", 2)[0].trim())
                .filter(s -> !s.isBlank())
                .orElse(http.getRemoteAddr());

        // 관리자 여부 (JWT 존재 시 무제한)
        boolean isAdmin = (authHeader != null && authHeader.startsWith("Bearer "));

        // ── 일반 사용자: 선제 한도 체크 ───────────────────────────────
        if (!isAdmin) {
            if (!dailyQuotaSupport.tryConsume(ip)) {
                // 초과: 429 + 헤더(remaining=0)
                return ResponseEntity.status(429)
                        .header("X-DailyReq-Remaining", "0")
                        .body(ChatResponse.builder()
                                .text("하루 3회 질문 한도를 초과했습니다. 내일 다시 시도해 주세요.")
                                .build());
            }
        }

        // 실제 호출
        ChatResponse resp = openAiService.chatBlocking(req);

        // 남은 횟수 헤더 세팅 (관리자는 -1로 표기)
        String remaining = isAdmin ? "-1" : String.valueOf(dailyQuotaSupport.remaining(ip));

        return ResponseEntity.ok()
                .header("X-DailyReq-Remaining", remaining)
                .body(resp);
    }


}
