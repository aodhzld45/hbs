package com.hbs.hsbbo.user.ai.controller;

import com.hbs.hsbbo.admin.ai.promptprofile.domain.entity.PromptProfile;
import com.hbs.hsbbo.admin.ai.promptprofile.service.PromptProfileService;
import com.hbs.hsbbo.admin.ai.sitekey.domain.entity.SiteKey;
import com.hbs.hsbbo.admin.ai.sitekey.service.SiteKeyService;
import com.hbs.hsbbo.admin.ai.widgetconfig.dto.response.WidgetConfigResponse;
import com.hbs.hsbbo.admin.ai.widgetconfig.service.WidgetConfigService;
import com.hbs.hsbbo.common.exception.CommonException;
import com.hbs.hsbbo.common.exception.CommonException.TooManyRequestsException;
import com.hbs.hsbbo.user.ai.dto.ChatRequest;
import com.hbs.hsbbo.user.ai.dto.ChatResponse;
import com.hbs.hsbbo.user.ai.dto.ChatWithPromptProfileRequest;
import com.hbs.hsbbo.user.ai.dto.ChatWithPromptProfileResponse;
import com.hbs.hsbbo.user.ai.service.OpenAiService;
import com.hbs.hsbbo.user.ai.support.DailyQuotaSupport;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
public class AiPlayGroundController {
    private final OpenAiService openAiService;
    private final DailyQuotaSupport dailyQuotaSupport;
    private final SiteKeyService siteKeyService;
    private final WidgetConfigService widgetConfigService;
    private final PromptProfileService promptProfileService;

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

    // Get /api/ai/public/widget=config : 위젯 설정 불러오기
    @GetMapping("/public/widget-config")
    @CrossOrigin(origins = "*", allowedHeaders = { "Content-Type", "Authorization", "X-HSBS-Site-Key" })
    public ResponseEntity<WidgetConfigResponse> getPublicWidgetConfig(
            @RequestHeader(value = "X-HSBS-Site-Key", required = false) String siteKeyHeader,
            @RequestParam(value = "siteKey", required = false) String siteKeyQuery,
            HttpServletRequest http
    ) {

        String origin   = http.getHeader("Origin");
        String referer  = http.getHeader("Referer");
        String ua       = http.getHeader("User-Agent");
        String ip       = Optional.ofNullable(http.getHeader("X-Forwarded-For"))
                .map(v -> v.split(",", 2)[0].trim())
                .filter(s -> !s.isBlank())
                .orElse(http.getRemoteAddr());

        log.info("[public-widget-config] siteKeyHeader={}, siteKeyQuery={}, origin={}, referer={}, ua={}, ip={}",
                mask(siteKeyHeader), mask(siteKeyQuery), origin, referer, ua, ip);


        String siteKey = (siteKeyHeader != null && !siteKeyHeader.isBlank())
                ? siteKeyHeader : siteKeyQuery;
        String host = extractClientHost(http);

        WidgetConfigResponse body = widgetConfigService.loadForPublic(siteKey, host);

        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(300, TimeUnit.SECONDS).cachePublic())
                .body(body);
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

    //  POST /api/ai/complete3
    //   - public js(hsbs-chat.js)용: siteKey + PromptProfile 조립 기반
    //   - 관리자(JWT) 외에는 SiteKey + Domain 검증 + quota 체크
    @PostMapping("/complete3")
    @CrossOrigin(
            origins = "*",
            allowedHeaders = { "Content-Type", "Authorization", "X-HSBS-Site-Key" }
    )
    public ResponseEntity<ChatWithPromptProfileResponse> complete3(
            @RequestBody ChatRequest userReq,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-HSBS-Site-Key", required = false) String siteKey,
            HttpServletRequest http
    ) {
        // ── 0. 기본 요청 검증 ─────────────────────────────────────────────
        if (userReq.getPrompt() == null || userReq.getPrompt().isBlank()) {
            throw new IllegalArgumentException("챗 프롬프트는 필수 입니다.");
        }

        // ── 1. 요청자 IP 추출 (X-Forwarded-For 우선) ─────────────────────
        String ip = Optional.ofNullable(http.getHeader("X-Forwarded-For"))
                .map(v -> v.split(",", 2)[0].trim())
                .filter(s -> !s.isBlank())
                .orElse(http.getRemoteAddr());

        // ── 2. 관리자 여부 (JWT 존재 시) ─────────────────────────────────
        boolean isAdmin = (authHeader != null && authHeader.startsWith("Bearer "));

        // ── 3. siteKey 필수 검증 (SaaS용 엔드포인트이므로 관리자도 필수) ──
        if (siteKey == null || siteKey.isBlank()) {
            throw new CommonException.UnauthorizedException("사이트키를 찾을 수 없습니다.");
        }

        // ── 4. 클라이언트 호스트 추출 (Origin/Referer 기반) ─────────────
        String host = extractClientHost(http);

        // ── 5. SiteKey + 도메인 검증 및 엔티티 조회 ─────────────────────
        //     - status/useTf/delTf, allowedDomains 등을 내부에서 체크
        SiteKey keyInfo = siteKeyService.assertActiveAndDomainAllowed(siteKey, host);

        // ── 6. 쿼터 정책 결정: SiteKey에 설정된 dailyCallLimit 기준 ──────
        //     - dailyCallLimit > 0 : 해당 값으로 siteKey 단위 일일 호출 제한
        //     - null 또는 0       : 별도 쿼터 없음 → 데모용으로 IP 기준 기본 제한만 사용
        Integer siteDailyLimit = keyInfo.getDailyCallLimit(); // 예: 500 등
        final int DEFAULT_FREE_IP_LIMIT = 10;                  // 데모/미설정 키용 기본 한도

        // 카운터 키 (Caffeine 캐시 키)
        String ipCounterKey  = "ip:" + ip;
        String skCounterKey  = "sk:" + keyInfo.getSiteKey();

        // 응답 헤더용 남은 횟수 (기본값: -1 = 사용 안 함 / 무제한)
        String ipRemainingHeader   = "-1";
        String skRemainingHeader   = "-1";
        String effectiveRemaining  = "-1";  // X-DailyReq-Remaining 에 넣을 값

        // ── 7. 관리자 계정은 쿼터 미적용 ─────────────────────────────────
        if (!isAdmin) {
            boolean hasSiteLimit = (siteDailyLimit != null && siteDailyLimit > 0);

            if (hasSiteLimit) {
                // 7-1) SiteKey에 일일 호출 한도가 설정된 경우
                //      → 이 값을 기준으로만 제한 (IP 제한은 적용하지 않음)
                boolean ok = dailyQuotaSupport.tryConsume(skCounterKey, siteDailyLimit);
                if (!ok) {
                    // siteKey 한도 초과
                    return ResponseEntity.status(429)
                            .header("X-SiteKey-Daily-Remaining", "0")
                            .header("X-IP-Daily-Remaining", "-1")
                            .header("X-DailyReq-Remaining", "0")
                            .body(ChatWithPromptProfileResponse.builder()
                                    .model(null)
                                    .text("해당 사이트키의 일일 호출 한도를 초과했습니다. 내일 다시 시도해 주세요.")
                                    .build());
                }

                int skRemain = dailyQuotaSupport.remaining(skCounterKey, siteDailyLimit);
                skRemainingHeader  = String.valueOf(skRemain);
                effectiveRemaining = skRemainingHeader; // 이 값이 실질적인 일일 한도

            } else {
                // 7-2) SiteKey에 별도 한도가 없는 경우
                //      → 데모/테스트 키로 보고 IP 기준 기본 한도만 적용
                boolean ok = dailyQuotaSupport.tryConsume(ipCounterKey, DEFAULT_FREE_IP_LIMIT);
                if (!ok) {
                    return ResponseEntity.status(429)
                            .header("X-IP-Daily-Remaining", "0")
                            .header("X-SiteKey-Daily-Remaining", "-1")
                            .header("X-DailyReq-Remaining", "0")
                            .body(ChatWithPromptProfileResponse.builder()
                                    .model(null)
                                    .text("무료 사용 한도를 초과했습니다. 내일 다시 시도해 주세요.")
                                    .build());
                }

                int ipRemain = dailyQuotaSupport.remaining(ipCounterKey, DEFAULT_FREE_IP_LIMIT);
                ipRemainingHeader  = String.valueOf(ipRemain);
                effectiveRemaining = ipRemainingHeader;
            }
        }

        // ── 8. SiteKey에 연결된 기본 PromptProfile 조회 ─────────────────
        //     (status/useTf/delTf 검증은 서비스 내에서 처리)
        PromptProfile profile =
                promptProfileService.findDefaultProfileForSiteKeyOrThrow(siteKey, host);

        // ── 9. PromptProfile + 사용자 입력 → OpenAI 요청 DTO 조립 ───────
        ChatWithPromptProfileRequest ppReq =
                promptProfileService.buildChatWithProfileRequest(profile, userReq);

        // ── 10. OpenAI 호출 (Blocking) ───────────────────────────────────
        ChatWithPromptProfileResponse response =
                openAiService.chatWithProfilePromptBlocking(ppReq);

        // ── 11. 응답 + 남은 횟수 헤더 세팅 ──────────────────────────────
        //      - X-DailyReq-Remaining : 실제 적용된 기준(사이트키 or IP)의 남은 횟수
        //      - X-IP-Daily-Remaining : IP 기준 카운터(미사용 시 -1)
        //      - X-SiteKey-Daily-Remaining : SiteKey 기준 카운터(미사용 시 -1)
        return ResponseEntity.ok()
                .header("X-DailyReq-Remaining", effectiveRemaining)
                .header("X-IP-Daily-Remaining", ipRemainingHeader)
                .header("X-SiteKey-Daily-Remaining", skRemainingHeader)
                .body(response);
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

    private String mask(String v) {
        if (v == null || v.isBlank()) return v;
        int n = v.length();
        if (n <= 4) return "****";
        return v.substring(0, Math.min(2, n)) + "****" + v.substring(n - Math.min(2, n));
    }
}
