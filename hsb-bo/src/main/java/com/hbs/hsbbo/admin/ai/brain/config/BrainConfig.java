package com.hbs.hsbbo.admin.ai.brain.config;

import com.hbs.hsbbo.admin.ai.brain.client.BrainClient;
import com.hbs.hsbbo.admin.ai.brain.client.FastApiBrainClient;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
@EnableConfigurationProperties(HsbsBrainProperties.class)
@RequiredArgsConstructor
public class BrainConfig {

    private final HsbsBrainProperties props;

    @Bean
    public WebClient brainWebClient() {
        return WebClient.builder()
                .baseUrl(props.getBaseUrl())
                .build();
    }

    @Bean
    public BrainClient brainClient(WebClient brainWebClient) {
        if (!props.isEnabled()) {
            return req -> { throw new IllegalStateException("Brain 연동이 disabled 상태입니다. hsbs.brain.enabled 값을 확인하세요."); };
        }
        return new FastApiBrainClient(brainWebClient, props);
    }
}
