package com.hbs.hsbbo.admin.ai.kb.worker;

import com.hbs.hsbbo.admin.ai.brain.config.KbJobSchedulerProperties;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class KbJobScheduler {

    private final TaskScheduler taskScheduler;
    private final KbJobWorker kbJobWorker;
    private final KbJobSchedulerProperties props;

    private volatile long currentDelayMs;
    private int idleStreak = 0;

    @PostConstruct
    public void start() {
        if (!props.isEnabled()) {
            log.info("[KbJobScheduler] disabled");
            return;
        }
        currentDelayMs = props.getMinDelayMs();
        scheduleNext(props.getInitialDelayMs());
        log.info("[KbJobScheduler] started (initialDelayMs={})", props.getInitialDelayMs());
    }

    private void scheduleNext(long delayMs) {
        taskScheduler.schedule(this::tick, Instant.now().plusMillis(delayMs));
    }

    private void tick() {
        if (!props.isEnabled()) return;

        try {
            // WorkerResult를 별도 enum으로 썼다는 가정
            WorkerResult r = kbJobWorker.runOnce();

            boolean idle = (r == WorkerResult.NO_JOB || r == WorkerResult.LOCK_LOST);

            if (idle) {
                idleStreak++;

                if (props.getIdleLogEvery() > 0 && (idleStreak % props.getIdleLogEvery() == 0)) {
                    log.info("[KbJobScheduler] idle... idleStreak={}, currentDelayMs={}", idleStreak, currentDelayMs);
                }

                if (idleStreak >= props.getIdleThreshold()) {
                    long next = (long) (currentDelayMs * props.getIdleBackoffMultiplier());
                    currentDelayMs = Math.min(props.getMaxDelayMs(), Math.max(props.getMinDelayMs(), next));
                }

            } else {
                idleStreak = 0;
                currentDelayMs = props.getMinDelayMs();
            }

        } catch (Exception e) {
            log.error("[KbJobScheduler] tick error", e);
            long next = currentDelayMs * 2;
            currentDelayMs = Math.min(props.getMaxDelayMs(), Math.max(props.getMinDelayMs(), next));
        } finally {
            scheduleNext(currentDelayMs);
        }
    }
}
