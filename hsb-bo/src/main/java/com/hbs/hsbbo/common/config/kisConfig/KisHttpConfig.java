package com.hbs.hsbbo.common.config.kisConfig;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

@Configuration
public class KisHttpConfig {

    @Bean(name = "kisWebClient")
    @Primary
        // 기본 주입은 무조건 이 Bean
    WebClient kisWebClient(WebClient.Builder builder,
                           @Value("${kis.domain}") String domain) {

        // (선택) 프록시 강제 미사용 + 타임아웃
        HttpClient httpClient = HttpClient.create()
                //.proxy(spec -> {}) // 시스템 프록시 무시 (임시 방어)
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 10_000)
                .doOnConnected(conn -> conn
                        .addHandlerLast(new ReadTimeoutHandler(15))
                        .addHandlerLast(new WriteTimeoutHandler(15)));

        return builder
                .baseUrl(domain) // ex) https://openapivts.koreainvestment.com:29443
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                // (권장) 호출 URL 확인용 로깅 필터
                .filter((req, next) -> {
                    // 여기서 찍히는 URL이 반드시 KIS 도메인 -> 모의/실전 구분해서
                    // 만약 127.0.0.1:80 이 찍히면 프록시/주입 문제
                    org.slf4j.LoggerFactory.getLogger("KIS_HTTP")
                            .info("[KIS] {} {}", req.method(), req.url());
                    return next.exchange(req);
                })
                .build();
    }
}
