package com.hbs.hsbbo.admin.ai.kb.worker;

import com.hbs.hsbbo.admin.ai.brain.config.KbJobSchedulerProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class KbJobScheduler {

    private final KbJobWorker kbJobWorker;
    private final KbJobSchedulerProperties schedProps;

    @Scheduled(
            fixedDelayString = "${hsbs.kb.job.fixed-delay-ms:5000}",
            initialDelayString = "${hsbs.kb.job.initial-delay-ms:3000}"
    )
    public void tick() {
        if (!schedProps.isEnabled()) {
            return;
        }

        try {
            kbJobWorker.runOnce();
        } catch (Exception e) {
            log.error("[KbJobScheduler] runOnce failed", e);
        }
    }
}
