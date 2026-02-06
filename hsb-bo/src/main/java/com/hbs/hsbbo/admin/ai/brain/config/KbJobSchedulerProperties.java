package com.hbs.hsbbo.admin.ai.brain.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "hsbs.kb.job")
public class KbJobSchedulerProperties {
    private boolean enabled = true;

    // adaptive
    private long minDelayMs = 2000;
    private long maxDelayMs = 60000;
    private long initialDelayMs = 3000;

    private int idleThreshold = 3;
    private double idleBackoffMultiplier = 2.0;

    // 0이면 로그 안 찍음, 그 외면 N번마다 1번
    private int idleLogEvery = 60;

}

