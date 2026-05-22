package com.hbs.hsbbo.admin.ai.brain.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hbs.hsbbo.admin.ai.brain.client.BrainClient;
import com.hbs.hsbbo.admin.ai.brain.client.FastApiBrainClient;
import com.hbs.hsbbo.admin.ai.brain.dto.request.BrainChatRequest;
import com.hbs.hsbbo.admin.ai.brain.dto.request.BrainDeleteIndexRequest;
import com.hbs.hsbbo.admin.ai.brain.dto.request.BrainIngestRequest;
import com.hbs.hsbbo.admin.ai.brain.dto.request.BrainVectorStoreCreateRequest;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainChatResponse;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainDeleteIndexResponse;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainHealthResponse;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainIngestResponse;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainVectorStoreCreateResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

@Configuration
@EnableConfigurationProperties(HsbsBrainProperties.class)
@RequiredArgsConstructor
public class BrainConfig {

    private final HsbsBrainProperties props;

    @Bean
    public WebClient brainWebClient() {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofMillis(props.getTimeoutMs()));

        return WebClient.builder()
                .baseUrl(props.getBaseUrl())
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }

    @Bean
    public WebClient hsbsBrainWebClient() {
        return WebClient.builder()
                .baseUrl(props.getBaseUrl())
                // 내부 통신 키: FastAPI에서도 동일하게 검사하는 X-API-KEY 헤더를 기본값으로 둔다.
                .defaultHeader("X-API-KEY", props.getApiKey() == null ? "" : props.getApiKey())
                .build();
    }

    @Bean
    public BrainClient brainClient(WebClient brainWebClient, ObjectMapper objectMapper) {
        if (!props.isEnabled()) {
            // Brain 연동을 끈 환경에서는 동일한 인터페이스를 유지하되, 호출 시점에 명확하게 실패시킨다.
            return new BrainClient() {
                @Override
                public BrainHealthResponse health() {
                    throw disabled();
                }

                @Override
                public BrainChatResponse chat(BrainChatRequest request) {
                    throw disabled();
                }

                @Override
                public BrainIngestResponse ingest(BrainIngestRequest request) {
                    throw disabled();
                }

                @Override
                public BrainDeleteIndexResponse deleteIndex(BrainDeleteIndexRequest request) {
                    throw disabled();
                }

                @Override
                public BrainVectorStoreCreateResponse createVectorStore(BrainVectorStoreCreateRequest request) {
                    throw disabled();
                }

                private IllegalStateException disabled() {
                    return new IllegalStateException("Brain integration is disabled. Check hsbs.brain.enabled.");
                }
            };
        }
        return new FastApiBrainClient(brainWebClient, props, objectMapper);
    }
}
