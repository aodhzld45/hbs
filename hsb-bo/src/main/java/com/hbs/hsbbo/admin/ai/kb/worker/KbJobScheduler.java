package com.hbs.hsbbo.admin.ai.kb.worker;

import com.hbs.hsbbo.admin.ai.brain.config.KbJobSchedulerProperties;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Component;

import java.time.Instant;
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
    // 중복 스케줄 방지: "현재 tick 예약이 이미 걸려있는가?"
    private final AtomicBoolean scheduled = new AtomicBoolean(false);

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
        taskScheduler.schedule(this::tick, Instant.now().plusMillis(100));
    }

    private void scheduleNext(long delayMs) {
        if (!props.isEnabled()) return;

        // 이미 예약이 걸려 있으면 스킵 (tick의 finally에서 항상 scheduleNext를 부르기 때문에 중복 방지)
        if (!scheduled.compareAndSet(false, true)) {
            return;
        }

        taskScheduler.schedule(this::tick, Instant.now().plusMillis(delayMs));
    }

    private void tick() {
        if (!props.isEnabled()) {
            scheduled.set(false);
            return;
        }

        scheduled.set(false);

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
            // 다음 tick 예약
            scheduleNext(currentDelayMs);
        }
    }
}
