package com.hbs.hsbbo.admin.repository;

import com.hbs.hsbbo.admin.domain.entity.AdminLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface AdminLogRepository extends JpaRepository<AdminLog, Long> {

    // 삭제되지 않은 전체 목록
    Page<AdminLog> findByDelTf(String delTf, Pageable pageable);

    // 관리자 로그 검색 키워드
    @Query("""
        SELECT l
        FROM AdminLog l
        WHERE l.delTf = 'N'
          AND (:adminId IS NULL OR l.adminId LIKE %:adminId%)
          AND (:action IS NULL OR l.action LIKE %:action%)
          AND (:detail IS NULL OR l.detail LIKE %:detail%)
          AND (
              (:start IS NULL OR :end IS NULL)
              OR (l.logDate BETWEEN :start AND :end)
          )
    """)
    Page<AdminLog> searchAdminLogs(
            @Param("adminId") String adminId,
            @Param("action") String action,
            @Param("detail") String detail,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            Pageable pageable
    );

    boolean existsByAdminIdAndActionAndUrlAndLogDateAfter(
            String adminId,
            String action,
            String url,
            LocalDateTime logDateAfter
    );
}
