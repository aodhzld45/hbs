package com.hbs.hsbbo.admin.ai.usage.repository;

import com.hbs.hsbbo.admin.ai.usage.domain.entity.UsageLog;
import com.hbs.hsbbo.admin.ai.usage.dto.UsageStatsProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
@Repository
public interface UsageStatsRepository extends JpaRepository<UsageLog, Long> {
    @Query(value = """
        SELECT
            -- 버킷 기준 날짜 (일/주 시작일/월 1일)
            CASE
                WHEN :period = 'DAILY' THEN DATE(u.reg_date)
                WHEN :period = 'WEEKLY'
                    THEN DATE_SUB(DATE(u.reg_date), INTERVAL (WEEKDAY(u.reg_date)) DAY)
                WHEN :period = 'MONTHLY'
                    THEN DATE_FORMAT(u.reg_date, '%Y-%m-01')
            END AS bucketDate,

            -- 라벨: 일/주/월 별로 다른 문자열 포맷
            CASE
                WHEN :period = 'DAILY'
                    THEN DATE_FORMAT(u.reg_date, '%Y-%m-%d')
                WHEN :period = 'WEEKLY'
                    THEN DATE_FORMAT(
                        DATE_SUB(DATE(u.reg_date), INTERVAL (WEEKDAY(u.reg_date)) DAY),
                        '%x-W%v'
                    )
                WHEN :period = 'MONTHLY'
                    THEN DATE_FORMAT(u.reg_date, '%Y-%m')
            END AS bucketLabel,

            COUNT(*)                                                    AS totalCalls,
            SUM(CASE WHEN u.success_tf = 'Y' THEN 1 ELSE 0 END)         AS successCalls,
            SUM(CASE WHEN u.success_tf = 'N' THEN 1 ELSE 0 END)         AS failCalls,
            COALESCE(SUM(u.prompt_tokens), 0)                           AS totalPromptTokens,
            COALESCE(SUM(u.completion_tokens), 0)                       AS totalCompletionTokens,
            COALESCE(SUM(u.total_tokens), 0)                            AS totalTokens,
            COALESCE(AVG(u.latency_ms), 0)                              AS avgLatencyMs
        FROM ai_usage_log u
        WHERE u.use_tf = 'Y'
          AND u.del_tf = 'N'
          AND u.tenant_id = :tenantId
          AND u.reg_date >= :from
          AND u.reg_date <  :to
          AND (:siteKeyId IS NULL OR u.site_key_id = :siteKeyId)
          AND (:channel IS NULL OR u.channel = :channel)
        GROUP BY 
            bucketDate,
            bucketLabel
        ORDER BY bucketDate DESC
        """,
            nativeQuery = true)
    List<UsageStatsProjection> findStats(
            @Param("tenantId") String tenantId,
            @Param("period") String period,          // 'DAILY' / 'WEEKLY' / 'MONTHLY'
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("siteKeyId") Long siteKeyId,
            @Param("channel") String channel
    );

}
