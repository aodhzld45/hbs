package com.hbs.hsbbo.user.ai.support;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDate;
import java.util.concurrent.atomic.LongAdder;

@Component
public class DailyQuotaSupport {

    private final Cache<String, LongAdder> dailyCount = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofDays(1)) // 하루 지나면 자동 리셋
            .maximumSize(10000)
            .build();

    // 기본 보호용 (IP 기반 etc)
    private static final int DEFAULT_DAILY_LIMIT = 10;

    private String key(String userKey) {
        return userKey + ":" + LocalDate.now(); // YYYY-MM-DD 기준
    }

    /** limit가 null 또는 0 이하이면 "제한 없음" 처리 */
    public boolean tryConsume(String userKey, Integer limit) {
        String k = key(userKey);
        LongAdder adder = dailyCount.get(k, kk -> new LongAdder());

        // 제한 없음
        if (limit == null || limit <= 0) {
            adder.increment();
            return true;
        }

        if (adder.intValue() >= limit) {
            return false;
        }
        adder.increment();
        return true;
    }

    public int remaining(String userKey, Integer limit) {
        if (limit == null || limit <= 0) {
            // 무제한인 경우 -1 같은 특수값을 주거나, 호출측에서 null 처리
            return -1;
        }
        LongAdder adder = dailyCount.getIfPresent(key(userKey));
        return (adder == null) ? limit : Math.max(0, limit - adder.intValue());
    }

    // 기존 호출 코드 깨지지 않도록 기본 limit 오버로드 유지
    public boolean tryConsume(String userKey) {
        return tryConsume(userKey, DEFAULT_DAILY_LIMIT);
    }

    public int remaining(String userKey) {
        return remaining(userKey, DEFAULT_DAILY_LIMIT);
    }
}