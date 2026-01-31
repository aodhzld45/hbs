package com.hbs.hsbbo.admin.ai.brain.config;

import com.hbs.hsbbo.admin.ai.brain.client.BrainClient;
import com.hbs.hsbbo.admin.ai.brain.client.FastApiBrainClient;
import com.hbs.hsbbo.admin.ai.brain.dto.request.BrainChatRequest;
import com.hbs.hsbbo.admin.ai.brain.dto.request.BrainIngestRequest;
import com.hbs.hsbbo.admin.ai.brain.dto.request.BrainVectorStoreCreateRequest;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainChatResponse;
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
                // 내부 통신 키: 우선 X-API-KEY 헤더로 통일 (FastAPI에서도 동일하게 검사)
                .defaultHeader("X-API-KEY", props.getApiKey() == null ? "" : props.getApiKey())
                .build();
    }

    @Bean
    public BrainClient brainClient(WebClient brainWebClient) {
        if (!props.isEnabled()) {
            return new BrainClient() {
                @Override
                public BrainChatResponse chat(BrainChatRequest request) {
                    throw new IllegalStateException("Brain 연동이 disabled 상태입니다. hsbs.brain.enabled 값을 확인하세요.");
                }

                @Override
                public BrainIngestResponse ingest(BrainIngestRequest request) {
                    throw new IllegalStateException("Brain 연동이 disabled 상태입니다. hsbs.brain.enabled 값을 확인하세요.");
                }

                @Override
                public BrainVectorStoreCreateResponse createVectorStore(BrainVectorStoreCreateRequest request) {
                    throw disabled();
                }

                private IllegalStateException disabled() {
                    return new IllegalStateException(
                            "Brain 연동이 disabled 상태입니다. hsbs.brain.enabled 값을 확인하세요."
                    );
                }
            };
        }
        return new FastApiBrainClient(brainWebClient, props);
    }
}
