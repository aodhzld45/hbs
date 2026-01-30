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
    private long fixedDelayMs = 5000;
    private long initialDelayMs = 3000;
}

