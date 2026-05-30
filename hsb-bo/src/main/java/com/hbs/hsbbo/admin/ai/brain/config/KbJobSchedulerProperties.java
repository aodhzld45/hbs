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

    // Adaptive polling
    private long minDelayMs = 5000;
    private long maxDelayMs = 60000;
    private long initialDelayMs = 3000;
    private long wakeUpDelayMs = 100;

    // Sleep mode keeps a rare safety scan while normal idle polling rests.
    private boolean sleepModeEnabled = true;
    private int sleepAfterIdleStreak = 5;
    private long safetyScanDelayMs = 900000;

    private int idleThreshold = 3;
    private double idleBackoffMultiplier = 2.0;

    // 0 disables idle logs. N logs once every N idle ticks.
    private int idleLogEvery = 0;

}
