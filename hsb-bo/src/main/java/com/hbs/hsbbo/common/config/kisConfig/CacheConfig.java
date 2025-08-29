package com.hbs.hsbbo.common.config.kisConfig;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;

@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * KIS와 무관한 일반 용도의 WebClient.
     * 기본 주입(@Primary) 아님! -> 실수로 주입되는 걸 방지하려고 이름을 붙였습니다.
     */
    @Bean(name = "generalWebClient")
    public WebClient generalWebClient() {
        return WebClient.builder().build();
    }

    @Bean
    public CacheManager cacheManager() {
        var price   = new CaffeineCache("price",
                Caffeine.newBuilder().expireAfterWrite(Duration.ofSeconds(3)).maximumSize(200).build());
        var history = new CaffeineCache("history",
                Caffeine.newBuilder().expireAfterWrite(Duration.ofSeconds(5)).maximumSize(200).build());
        var m = new SimpleCacheManager();
        m.setCaches(List.of(price, history));
        return m;
    }
}
