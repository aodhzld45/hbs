package com.hbs.hsbbo.admin.ai.brain.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hbs.hsbbo.admin.ai.brain.config.HsbsBrainProperties;
import com.hbs.hsbbo.admin.ai.brain.dto.request.BrainChatRequest;
import com.hbs.hsbbo.admin.ai.brain.dto.request.BrainIngestRequest;
import com.hbs.hsbbo.admin.ai.brain.dto.request.BrainVectorStoreCreateRequest;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainChatResponse;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainIngestResponse;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainVectorStoreCreateResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
@Slf4j
public class FastApiBrainClient implements BrainClient{

    private final WebClient webClient;
    private final HsbsBrainProperties props;
    private final ObjectMapper objectMapper;

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
            String raw = webClient.post()
                    .uri(props.getIngestPath())
                    .header("X-HSBS-Internal-Token", props.getApiKey())
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(String.class) // RAW로 받기
                    .onErrorResume(WebClientResponseException.class, ex ->
                            Mono.error(new RuntimeException(
                                    "Brain ingest 실패: " + ex.getStatusCode() + " " + safeBody(ex.getResponseBodyAsString()), ex
                            ))
                    )
                    .block();

            log.info("[Brain ingest RAW] {}", safeBody(raw));

            BrainIngestResponse resp = objectMapper.readValue(raw, BrainIngestResponse.class);

            // DTO도 요약해서.
            log.info("[Brain ingest DTO] ok={} ingestId={} vsId={} fileId={} msg={}",
                    resp.isOk(), resp.getIngestId(), resp.getVectorStoreId(), resp.getVectorFileId(), resp.getMessage());

            // 필요하면 summaryText도 일부만
            if (resp.getSummaryText() != null) {
                log.info("[Brain ingest summary] {}", safeBody(resp.getSummaryText()));
            }

            return resp;

        } catch (Exception e) {
            throw new RuntimeException("Brain 서버 ingest 호출 실패", e);
        }
    }

    @Override
    public BrainVectorStoreCreateResponse createVectorStore(BrainVectorStoreCreateRequest request) {
        try {
            return webClient.post()
                    .uri("/api/brain/vector-stores")
                    .header("X-HSBS-Internal-Token", props.getApiKey())
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(BrainVectorStoreCreateResponse.class)
                    .onErrorResume(WebClientResponseException.class, ex ->
                            Mono.error(new RuntimeException(
                                    "Brain createVectorStore 실패: " + ex.getStatusCode() + " " + ex.getResponseBodyAsString(), ex
                            ))
                    )
                    .block();
        } catch (Exception e) {
            throw new RuntimeException("Brain 서버 createVectorStore 호출 실패", e);
        }
    }

    private String safeBody(String s) {
        if (s == null) return null;
        // 로그 폭발 방지 (필요시 조정)
        return s.length() > 2000 ? s.substring(0, 2000) + "...(truncated)" : s;
    }
}
