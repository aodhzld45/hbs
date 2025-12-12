package com.hbs.hsbbo.admin.ai.usage.repository;

import com.hbs.hsbbo.admin.ai.usage.domain.entity.UsageLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UsageLogRepository extends JpaRepository<UsageLog, Long> {
    /** 소프트 삭제 아닌 단건 조회 */
    @Query("""
           SELECT l FROM UsageLog l
            WHERE l.id = :id
              AND l.delTf = 'N'
           """)
    Optional<UsageLog> findActiveById(@Param("id") Long id);

    /**
     * 기본 검색 + 통계용 조회
     *
     * - delTf = 'N' (소프트 삭제 제외)
     * - tenantId: null 이면 전체, 아니면 해당 테넌트만
     * - siteKeyId: null 이면 전체, 아니면 해당 siteKey만
     * - promptProfileId: null 이면 전체, 아니면 해당 프로필만
     * - channel: null 이면 전체, 아니면 해당 채널만(widget/admin/api 등)
     * - model: null 이면 전체, 아니면 해당 모델만
     * - successTf: null 이면 전체, 아니면 'Y' / 'N' 필터
     * - from ~ to: null 이면 기간 제한 없음, 둘 다 채우면 regDate 기준 기간 조회
     */
    @Query("""
           SELECT l FROM UsageLog l
            WHERE l.delTf = 'N'
              AND (:tenantId IS NULL OR l.tenantId = :tenantId)
              AND (:siteKeyId IS NULL OR l.siteKey.id = :siteKeyId)
              AND (:promptProfileId IS NULL OR l.promptProfile.id = :promptProfileId)
              AND (:channel IS NULL OR l.channel = :channel)
              AND (:model IS NULL OR l.model = :model)
              AND (:successTf IS NULL OR l.successTf = :successTf)
              AND (:from IS NULL OR l.regDate >= :from)
              AND (:to IS NULL OR l.regDate < :to)
           """)
    Page<UsageLog> search(
            @Param("tenantId") String tenantId,
            @Param("siteKeyId") Long siteKeyId,
            @Param("promptProfileId") Long promptProfileId,
            @Param("channel") String channel,
            @Param("model") String model,
            @Param("successTf") String successTf,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            Pageable pageable
    );

    /** 대화 히스토리용: conversationId 기준 정렬 조회 (나중에 conversation 기능에 사용 예정) */
    @Query("""
           SELECT l FROM UsageLog l
            WHERE l.delTf = 'N'
              AND l.conversationId = :conversationId
            ORDER BY l.regDate ASC
           """)
    List<UsageLog> findConversationLogs(@Param("conversationId") String conversationId);
}
