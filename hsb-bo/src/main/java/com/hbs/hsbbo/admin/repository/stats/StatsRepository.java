package com.hbs.hsbbo.admin.repository.stats;

import java.time.LocalDateTime;
import java.util.List;

// 공통 통계 repository 인터페이스
public interface StatsRepository {
    List<Object[]> countContentMonthly(LocalDateTime start, LocalDateTime end);
    List<Object[]> countContentTypeRatio(LocalDateTime start, LocalDateTime end);
    List<Object[]> contentPopular(LocalDateTime start, LocalDateTime end);
    List<Object[]> commentTarget(LocalDateTime start, LocalDateTime end);
    List<Object[]> userLogHour();
}