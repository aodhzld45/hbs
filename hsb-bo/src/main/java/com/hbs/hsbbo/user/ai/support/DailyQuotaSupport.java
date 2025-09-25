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

    private final int DAILY_LIMIT = 3;

    private String key(String userKey) {
        return userKey + ":" + LocalDate.now(); // YYYY-MM-DD 기준
    }

    /** true = 사용 가능 / false = 제한 초과 */
    public boolean tryConsume(String userKey) {
        String k = key(userKey);
        LongAdder adder = dailyCount.get(k, kk -> new LongAdder());
        if (adder.intValue() >= DAILY_LIMIT) {
            return false;
        }
        adder.increment();
        return true;
    }

    public int remaining(String userKey) {
        LongAdder adder = dailyCount.getIfPresent(key(userKey));
        return (adder == null) ? DAILY_LIMIT : Math.max(0, DAILY_LIMIT - adder.intValue());
    }
}
