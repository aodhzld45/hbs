package com.hbs.hsbbo.user.ai.controller;

import com.hbs.hsbbo.admin.ai.sitekey.service.SiteKeyService;
import com.hbs.hsbbo.common.exception.CommonException;
import com.hbs.hsbbo.common.exception.CommonException.TooManyRequestsException;
import com.hbs.hsbbo.user.ai.dto.ChatRequest;
import com.hbs.hsbbo.user.ai.dto.ChatResponse;
import com.hbs.hsbbo.user.ai.service.OpenAiService;
import com.hbs.hsbbo.user.ai.support.DailyQuotaSupport;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Optional;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiPlayGroundController {
    private final OpenAiService openAiService;
    private final DailyQuotaSupport dailyQuotaSupport;
    private final SiteKeyService siteKeyService;

    //  HEAD /api/ai/ping : 유효 키면 204, 없거나 무효면 401/403
    @RequestMapping(value = "/ping", method = {RequestMethod.GET, RequestMethod.HEAD})
    public ResponseEntity<Void> ping(
            @RequestHeader(value = "X-HSBS-Site-Key", required = false) String siteKeyHeader,
            @RequestParam(value = "siteKey", required = false) String siteKeyQuery,
            HttpServletRequest http) {

        String siteKey = (siteKeyHeader != null && !siteKeyHeader.isBlank())
                ? siteKeyHeader
                : siteKeyQuery;

        if (siteKey == null || siteKey.isBlank()) {
            throw new CommonException.UnauthorizedException("사이트키를 찾을 수 없습니다.");
        }

        String host = extractClientHost(http);

        siteKeyService.assertActiveAndDomainAllowed(siteKey, host); // 정책 위반 시 ForbiddenException → 403
        return ResponseEntity.noContent().build(); // 204
    }

    //  POST /api/ai/complete : - 포트폴리오용
    //   - 키 기반 쿼리 소모/응답 헤더(Remaining)
    @PostMapping("/complete")
    @CrossOrigin(origins = "*", allowedHeaders = { "Content-Type", "Authorization", "X-HSBS-Site-Key" })
    public ResponseEntity<ChatResponse> complete(
            @RequestBody ChatRequest req,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletRequest http) {

        if (req.getPrompt() == null || req.getPrompt().isBlank()) {
            throw new IllegalArgumentException("챗 프롬프트는 필수 입니다.");
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

        // 실제 OpenAI 호출
        ChatResponse resp = openAiService.chatBlocking(req);

        // 남은 횟수 헤더 세팅 (관리자는 -1로 표기)
        String remaining = isAdmin ? "-1" : String.valueOf(dailyQuotaSupport.remaining(ip));

        return ResponseEntity.ok()
                .header("X-DailyReq-Remaining", remaining)
                .body(resp);
    }

    //  POST /api/ai/complete : 관리자(JWT) 외에는 SiteKey 필수
    //   - SiteKey + Domain 검증(활성/삭제/사용여부/상태/허용도메인)
    //   - 키 기반 쿼리 소모/응답 헤더(Remaining)
    @PostMapping("/complete2")
    @CrossOrigin(origins = "*", allowedHeaders = { "Content-Type", "Authorization", "X-HSBS-Site-Key" })
    public ResponseEntity<ChatResponse> complete2(
            @RequestBody ChatRequest req,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-HSBS-Site-Key", required = false) String siteKey,
            HttpServletRequest http) {

        if (req.getPrompt() == null || req.getPrompt().isBlank()) {
            throw new IllegalArgumentException("챗 프롬프트는 필수 입니다.");
        }

        // 식별자(IP) 추출
        String ip = Optional.ofNullable(http.getHeader("X-Forwarded-For"))
                .map(v -> v.split(",", 2)[0].trim())
                .filter(s -> !s.isBlank())
                .orElse(http.getRemoteAddr());

        // 관리자 여부 (JWT 존재 시 무제한)
        boolean isAdmin = (authHeader != null && authHeader.startsWith("Bearer "));
        String consumerKey; // 쿼ота 카운팅 키

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

        String host = extractClientHost(http);
        siteKeyService.assertActiveAndDomainAllowed(siteKey, host); // 실패 시 403

        // 키 기준 쿼ота 소모
        consumerKey = "sk:" + siteKey;
        if (!dailyQuotaSupport.tryConsume(consumerKey)) {
            // 전역 핸들러가 429로 변환
            throw new TooManyRequestsException("Daily quota exceeded");
        }

        // 실제 OpenAI 호출
        ChatResponse resp = openAiService.chatBlocking(req);

        // 남은 횟수 헤더 세팅 (관리자는 -1로 표기)
        String remaining = isAdmin ? "-1" : String.valueOf(dailyQuotaSupport.remaining(ip));

        return ResponseEntity.ok()
                .header("X-DailyReq-Remaining", remaining)
                .body(resp);
    }

    /* =========================
     * Helpers
     * ========================= */
    /** Origin → Referer 순으로 호스트를 추출 */
    private String extractClientHost(HttpServletRequest http) {
        String origin  = http.getHeader("Origin");
        String referer = http.getHeader("Referer");
        String host = hostOrNull(origin);
        return (host != null) ? host : hostOrNull(referer);
    }

    private String hostOrNull(String url) {
        if (url == null || url.isBlank()) return null;
        try { return new URI(url).getHost(); } catch (Exception e) { return null; }
    }
}
