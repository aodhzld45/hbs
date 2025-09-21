package com.hbs.hsbbo.user.ai.service;

import com.hbs.hsbbo.user.ai.dto.ChatRequest;
import com.hbs.hsbbo.user.ai.dto.ChatResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class OpenAiService {

    private final WebClient openAiWebClient;

    public OpenAiService(@Qualifier("openAiWebClient") WebClient openAiWebClient) {
        this.openAiWebClient = openAiWebClient;
    }

    @Value("${openai.model:gpt-4o-mini}")
    private String defaultModel;

    // 재시도 정책: 429/5xx에서만 최대 3회, 지수백오프(0.8s→1.6s→3.2s, 최대 5s), 지터 50%
    private Retry retrySpec() {
        return Retry
                .backoff(3, Duration.ofMillis(800))
                .maxBackoff(Duration.ofSeconds(5))
                .jitter(0.5)
                .filter(err -> {
                    if (err instanceof TooManyRequestsException) return true;
                    if (err instanceof WebClientResponseException ex) {
                        int s = ex.getStatusCode().value();
                        return s >= 500; // 5xx
                    }
                    return false;
                })
                .onRetryExhaustedThrow((spec, signal) -> signal.failure());
    }

    public Mono<ChatResponse> chat(ChatRequest req) {
        String model = (req.getModel() == null || req.getModel().isBlank())
                ? defaultModel : req.getModel();

        var msgs = new java.util.ArrayList<Map<String,Object>>();
        msgs.add(Map.of("role", "system",
                "content", (req.getSystem() != null && !req.getSystem().isBlank())
                        ? req.getSystem()
                        : "You are a helpful assistant."));
        if (req.getContext() != null && !req.getContext().isBlank()) {
            msgs.add(Map.of("role", "user", "content", "Context:\n" + req.getContext()));
        }
        msgs.add(Map.of("role", "user", "content", (req.getPrompt() == null ? "" : req.getPrompt())));

        var body = Map.of(
                "model", model,
                "messages", msgs,
                "temperature", req.getTemperature() == null ? 0.3 : req.getTemperature(),
                "max_tokens", req.getMaxTokens() == null ? 600 : req.getMaxTokens()
        );

        return openAiWebClient.post()
                .uri("/chat/completions")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                // === 상태코드별 처리 ===
                .onStatus(s -> s.value() == 429, this::asTooManyRequests)
                .onStatus(s -> s.is4xxClientError(), this::asClientError)
                .onStatus(s -> s.is5xxServerError(), this::asServerError)
                // === 본문 파싱 ===
                .bodyToMono(Map.class)
                // === 응답 매핑 ===
                .map(res -> {
                    var choices = (List<Map<String,Object>>) res.get("choices");
                    String text = "";
                    if (choices != null && !choices.isEmpty()) {
                        var msg = (Map<String,Object>) choices.get(0).get("message");
                        if (msg != null && msg.get("content") != null) {
                            text = String.valueOf(msg.get("content"));
                        }
                    }
                    var usage = (Map<String,Object>) res.get("usage");
                    Integer promptT = usage == null ? null : toInt(usage.get("prompt_tokens"));
                    Integer complT  = usage == null ? null : toInt(usage.get("completion_tokens"));
                    Integer totalT  = usage == null ? null : toInt(usage.get("total_tokens"));
                    String usedModel = (String) res.get("model");

                    return ChatResponse.builder()
                            .model(usedModel == null ? model : usedModel)
                            .text(text)
                            .inputTokens(promptT)
                            .outputTokens(complT)
                            .totalTokens(totalT)
                            .build();
                })
                // === 레이트리밋/5xx 재시도 ===
                .retryWhen(retrySpec())
                // === 전체 타임아웃(네트워크 지연 방지) ===
                .timeout(Duration.ofSeconds(30));
    }

    public ChatResponse chatBlocking(ChatRequest req) {
        return chat(req).block(Duration.ofSeconds(35));
    }

    // ---- helpers ----

    private Mono<? extends Throwable> asTooManyRequests(ClientResponse resp) {
        // Retry-After / x-ratelimit-* 헤더 확인 (있으면 로그로 남김)
        var h = resp.headers().asHttpHeaders();
        String retryAfter = h.getFirst("Retry-After");
        String resetReq   = h.getFirst("x-ratelimit-reset-requests");
        String resetTok   = h.getFirst("x-ratelimit-reset-tokens");
        log.warn("[OPENAI] 429 Too Many Requests. retry-after={}, reset-req={}, reset-tok={}",
                retryAfter, resetReq, resetTok);
        return resp.bodyToMono(String.class)
                .defaultIfEmpty("")
                .flatMap(body -> Mono.error(new TooManyRequestsException("429 Too Many Requests: " + body)));
    }

    private Mono<? extends Throwable> asClientError(ClientResponse resp) {
        return resp.bodyToMono(String.class)
                .defaultIfEmpty("")
                .flatMap(body -> {
                    log.error("[OPENAI] 4xx error {} body={}", resp.statusCode().value(), body);
                    return Mono.error(new WebClientResponseException(
                            "OpenAI 4xx: " + body,
                            resp.statusCode().value(), resp.statusCode().toString(),
                            null, null, null));
                });
    }

    private Mono<? extends Throwable> asServerError(ClientResponse resp) {
        return resp.bodyToMono(String.class)
                .defaultIfEmpty("")
                .flatMap(body -> {
                    log.error("[OPENAI] 5xx error {} body={}", resp.statusCode().value(), body);
                    return Mono.error(new WebClientResponseException(
                            "OpenAI 5xx: " + body,
                            resp.statusCode().value(), resp.statusCode().toString(),
                            null, null, null));
                });
    }

    private Integer toInt(Object o) {
        if (o == null) return null;
        if (o instanceof Integer i) return i;
        try { return Integer.parseInt(String.valueOf(o)); } catch (Exception e) { return null; }
    }

    /** 429 식별용 커스텀 예외 (재시도 필터에 사용) */
    private static class TooManyRequestsException extends RuntimeException {
        public TooManyRequestsException(String msg) { super(msg); }
    }

    public ChatResponse chatBlockingMvc(ChatRequest req) {
        try {
            return chat(req).block(Duration.ofSeconds(35));
        } catch (TooManyRequestsException e) {
            // 429 그대로 반환 (프론트에서 재시도 안내하기 좋음)
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, e.getMessage(), e);
        } catch (WebClientResponseException e) {
            // OpenAI가 보낸 상태코드/본문을 그대로 전달
            throw new ResponseStatusException(e.getStatusCode(), e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            // 기타 예외는 502로 래핑
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "OpenAI call failed", e);
        }
    }
}
