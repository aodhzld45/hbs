package com.hbs.hsbbo.admin.ai.brain.client;

import com.hbs.hsbbo.admin.ai.brain.config.HsbsBrainProperties;
import com.hbs.hsbbo.admin.ai.brain.dto.request.BrainChatRequest;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainChatResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
public class FastApiBrainClient implements BrainClient{

    private final WebClient webClient;
    private final HsbsBrainProperties props;


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
}
