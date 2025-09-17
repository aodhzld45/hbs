package com.hbs.hsbbo.common.config.aiConfig;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

@Configuration
public class OpenAiHttpConfig {

    @Bean(name = "openAiWebClient")
    WebClient openAiWebClient(WebClient.Builder builder,
                              @Value("${openai.base-url}") String baseUrl,
                              @Value("${openai.api-key}") String apiKey) {

        HttpClient httpClient = HttpClient.create()
                .followRedirect(false)
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 10_000)
                .responseTimeout(Duration.ofSeconds(20))
                .doOnConnected(conn -> conn
                        .addHandlerLast(new ReadTimeoutHandler(20))
                        .addHandlerLast(new WriteTimeoutHandler(20)));

        // 요청/응답 로깅
        ExchangeFilterFunction logReq = ExchangeFilterFunction.ofRequestProcessor(req -> {
            org.slf4j.LoggerFactory.getLogger("OPENAI_HTTP")
                    .info("[OPENAI] {} {}", req.method(), req.url());
            return reactor.core.publisher.Mono.just(req);
        });
        ExchangeFilterFunction logRes = ExchangeFilterFunction.ofResponseProcessor(res -> {
            org.slf4j.LoggerFactory.getLogger("OPENAI_HTTP")
                    .info("[OPENAI] <= {}", res.statusCode());
            return reactor.core.publisher.Mono.just(res);
        });

        return builder
                .baseUrl(baseUrl) // ex) https://api.openai.com/v1
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, "application/json")
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .filter(logReq)
                .filter(logRes)
                .build();
    }
}
