package com.hbs.hsbbo.admin.ai.kb.worker;

import com.hbs.hsbbo.admin.ai.brain.config.KbJobSchedulerProperties;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.atomic.AtomicBoolean;

@Slf4j
@Component
@RequiredArgsConstructor
public class KbJobScheduler {

    private final TaskScheduler taskScheduler;
    private final KbJobWorker kbJobWorker;
    private final KbJobSchedulerProperties props;

    private volatile long currentDelayMs;
    private int idleStreak = 0;
    private int errorStreak = 0;
    private final AtomicBoolean scheduled = new AtomicBoolean(false);
    private final Object scheduleLock = new Object();
    private ScheduledFuture<?> scheduledFuture;

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

    public void wakeUpNow() {
        if (!props.isEnabled()) return;
        idleStreak = 0;
        errorStreak = 0;
        currentDelayMs = props.getMinDelayMs();
        scheduleNext(props.getWakeUpDelayMs(), true);
    }

    private void scheduleNext(long delayMs) {
        scheduleNext(delayMs, false);
    }

    private void scheduleNext(long delayMs, boolean replaceExisting) {
        if (!props.isEnabled()) return;

        synchronized (scheduleLock) {
            if (scheduledFuture != null && !scheduledFuture.isDone()) {
                if (!replaceExisting) {
                    return;
                }
                scheduledFuture.cancel(false);
                scheduled.set(false);
            }

            if (!scheduled.compareAndSet(false, true)) {
                return;
            }

            scheduledFuture = taskScheduler.schedule(this::tick, Instant.now().plusMillis(delayMs));
        }
    }

    private void tick() {
        if (!props.isEnabled()) {
            clearScheduledMarker();
            return;
        }

        clearScheduledMarker();

        try {
            WorkerResult r = kbJobWorker.runOnce();

            boolean idle = (r == WorkerResult.NO_JOB || r == WorkerResult.LOCK_LOST);

            if (idle) {
                idleStreak++;

                if (props.getIdleLogEvery() > 0 && (idleStreak % props.getIdleLogEvery() == 0)) {
                    log.info("[KbJobScheduler] idle... idleStreak={}, currentDelayMs={}", idleStreak, currentDelayMs);
                }

                if (isSleepModeReady()) {
                    currentDelayMs = Math.max(props.getMinDelayMs(), props.getSafetyScanDelayMs());
                    if (props.getIdleLogEvery() > 0) {
                        log.info("[KbJobScheduler] sleep mode. idleStreak={}, safetyScanDelayMs={}",
                                idleStreak, currentDelayMs);
                    }
                } else if (idleStreak >= props.getIdleThreshold()) {
                    long next = (long) (currentDelayMs * props.getIdleBackoffMultiplier());
                    currentDelayMs = Math.min(props.getMaxDelayMs(), Math.max(props.getMinDelayMs(), next));
                }

            } else {
                idleStreak = 0;
                errorStreak = 0;
                currentDelayMs = props.getMinDelayMs();
            }

        } catch (Exception e) {
            errorStreak++;

            if (errorStreak == 1 || errorStreak % 10 == 0) {
                log.error("[KbJobScheduler] tick error (errorStreak={}, delayMs={})", errorStreak, currentDelayMs, e);
            } else {
                log.warn("[KbJobScheduler] tick error (errorStreak={}, delayMs={}, msg={})",
                        errorStreak, currentDelayMs, e.toString());
            }

            long next = currentDelayMs * 2;
            currentDelayMs = Math.min(props.getMaxDelayMs(), Math.max(props.getMinDelayMs(), next));
        } finally {
            scheduleNext(currentDelayMs);
        }
    }

    private void clearScheduledMarker() {
        synchronized (scheduleLock) {
            scheduled.set(false);
            scheduledFuture = null;
        }
    }

    private boolean isSleepModeReady() {
        return props.isSleepModeEnabled()
                && idleStreak >= props.getSleepAfterIdleStreak()
                && props.getSafetyScanDelayMs() > 0;
    }
}
