package com.hbs.hsbbo.admin.ai.brain.client;

import com.hbs.hsbbo.admin.ai.brain.config.HsbsBrainProperties;
import com.hbs.hsbbo.admin.ai.brain.dto.request.BrainChatRequest;
import com.hbs.hsbbo.admin.ai.brain.dto.request.BrainIngestRequest;
import com.hbs.hsbbo.admin.ai.brain.dto.request.BrainVectorStoreCreateRequest;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainChatResponse;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainIngestResponse;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainVectorStoreCreateResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.Duration;

@RequiredArgsConstructor
@Slf4j
public class FastApiBrainClient implements BrainClient{

    private final WebClient webClient;
    private final HsbsBrainProperties props;

    private static final String VECTOR_STORE_CREATE_PATH = "/api/brain/vector-stores";

    @Override
    public BrainChatResponse chat(BrainChatRequest request) {
        try {
            return webClient.post()
                    .uri("/brain/chat") // FastAPI 쪽에서 /v1/brain/chat 이면 baseUrl에 /v1 포함
                    .header("X-HSBS-Internal-Token", props.getApiKey())
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(BrainChatResponse.class)
                    .onErrorResume(WebClientResponseException.class, ex -> {
                        // 필요하면 로깅 + fallback 처리
                        // ex.getStatusCode(), ex.getResponseBodyAsString() 등
                        return Mono.error(ex);
                    })
                    .block();
            } catch (Exception e) {
            throw new RuntimeException("Brain 서버 호출 실패", e);
        }
    }

    @Override
    public BrainIngestResponse ingest(BrainIngestRequest request) {
        try {
            return webClient.post()
                    .uri(props.getIngestPath())  // yml/env에서 받은 ingest-path 사용
                    .header("X-HSBS-Internal-Token", props.getApiKey())
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(BrainIngestResponse.class)
                    .onErrorResume(WebClientResponseException.class, ex ->
                            Mono.error(new RuntimeException(
                                    "Brain ingest 실패: " + ex.getStatusCode() + " " + ex.getResponseBodyAsString(), ex
                            ))
                    )
                    .block();
        } catch (Exception e) {
            throw new RuntimeException("Brain 서버 ingest 호출 실패", e);
        }
    }

    @Override
    public BrainVectorStoreCreateResponse createVectorStore(BrainVectorStoreCreateRequest request) {
        if (props == null || !props.isEnabled()) {
            throw new IllegalStateException("hsbs.brain.enabled=false 이므로 Brain 연동이 비활성화 상태입니다.");
        }

        if (props.getBaseUrl() == null || props.getBaseUrl().isBlank()) {
            throw new IllegalStateException("hsbs.brain.base-url 설정이 비어있습니다.");
        }

        int timeoutMs = props.getTimeoutMs() != null ? props.getTimeoutMs() : 15000;

        try {
            return webClient.post()
                    .uri(VECTOR_STORE_CREATE_PATH)
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(BrainVectorStoreCreateResponse.class)
                    .timeout(Duration.ofMillis(timeoutMs))
                    .block();
        } catch (WebClientResponseException e) {
            // Brain 서버가 내려준 상태코드 + 바디 확인 가능
            log.error("Brain createVectorStore failed. status={}, body={}",
                    e.getStatusCode(), safeBody(e.getResponseBodyAsString()), e);
            throw e;
        } catch (Exception e) {
            log.error("Brain createVectorStore error. baseUrl={}, path={}, request={}",
                    props.getBaseUrl(), VECTOR_STORE_CREATE_PATH, request, e);
            throw e;
        }
    }

    private String safeBody(String s) {
        if (s == null) return null;
        // 로그 폭발 방지 (필요시 조정)
        return s.length() > 2000 ? s.substring(0, 2000) + "...(truncated)" : s;
    }
}
