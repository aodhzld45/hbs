package com.hbs.hsbbo.user.kis.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

@Slf4j
@Service
public class KisAuthService {

    private final WebClient webClient;

    @Value("${kis.oauth-path}") private String oauthPath; // "/oauth2/tokenP"
    @Value("${kis.app-key}")    private String appKey;
    @Value("${kis.app-secret}") private String appSecret;

    public KisAuthService(@Qualifier("kisWebClient") WebClient webClient) {
        this.webClient = webClient;
    }

    // 갱신 시점 버퍼(초)
    private static final long refreshMarginSec = 60;

    private record Token(String accessToken, long exp) {}
    private final AtomicReference<Token> cache = new AtomicReference<>();

    /**
     * AccessToken 조회 (만료 전까지 캐시 사용, 동시성 안전)
     */
    public String getAccessToken() {
        var now = Instant.now().getEpochSecond();
        var current = cache.get();

        // 1차 체크 (락 밖) → 대부분은 여기서 return
        if (current != null && current.exp() - refreshMarginSec > now) {
            return current.accessToken();
        }

        synchronized (this) {
            now = Instant.now().getEpochSecond();
            current = cache.get();
            // 2차 체크 (락 안) → 다른 스레드가 이미 갱신했으면 그대로 사용
            if (current != null && current.exp() - refreshMarginSec > now) {
                return current.accessToken();
            }

            log.info("[KIS] requesting new access_token path={}", oauthPath);

            var resp = webClient.post()
                    .uri(b -> b.path(oauthPath).build())   // baseUrl + 상대경로
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of(
                            "grant_type", "client_credentials",
                            "appkey", appKey,
                            "appsecret", appSecret))
                    .retrieve()
                    .onStatus(s -> s.isError(), r ->
                            r.bodyToMono(String.class).map(body ->
                                    new IllegalStateException("KIS token error "
                                            + r.statusCode().value() + ": " + body)))
                    .bodyToMono(Map.class)
                    .block();

            if (resp == null || !resp.containsKey("access_token")) {
                log.error("[KIS] token response invalid: {}", resp);
                throw new IllegalStateException("KIS token 발급 실패: " + resp);
            }

            var token = (String) resp.get("access_token");
            var ttl   = Long.parseLong(String.valueOf(resp.getOrDefault("expires_in", "600")));
            var expAt = Instant.now().getEpochSecond() + ttl;

            cache.set(new Token(token, expAt));
            log.info("[KIS] token issued, ttl={}s, expAt={}", ttl, expAt);

            return token;
        }
    }

    /** 강제 갱신 (401 응답 등에서 사용) */
    public void forceRefresh() {
        log.info("[KIS] forceRefresh called: clear token cache");
        cache.set(null);
    }
}
