package com.hbs.hsbbo.admin.repository.stats;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class StatsRepositoryImpl implements StatsRepository {

    private final EntityManager em;

    // 월별 콘텐츠 등록 건수 집계 (예: "2025-06", 15건)
    @Override
    public List<Object[]> countContentMonthly(LocalDateTime start, LocalDateTime end) {
        return em.createNativeQuery("""
            SELECT DATE_FORMAT(c.regDate, '%Y-%m') AS month, COUNT(*) AS count
            FROM contentfile c
            WHERE c.regDate BETWEEN :start AND :end
            GROUP BY month
            ORDER BY month
        """)
                .setParameter("start", start)
                .setParameter("end", end)
                .getResultList();
    }

    // 콘텐츠 유형별 비율 집계 (예: 영상: 10, 이미지: 5)
    @Override
    public List<Object[]> countContentTypeRatio(LocalDateTime start, LocalDateTime end) {
        return em.createNativeQuery("""
            SELECT contentType, COUNT(*) AS count
            FROM contentfile
            WHERE regDate BETWEEN :start AND :end            
            GROUP BY contentType;
            """, Object[].class)
                .setParameter("start", start)
                .setParameter("end", end)
                .getResultList();
    }

    // 인기 콘텐츠 TOP 5
    @Override
    public List<Object[]> contentPopular(LocalDateTime start, LocalDateTime end) {
        return em.createNativeQuery("""
            SELECT title, view_count
            FROM contentfile
            WHERE regDate BETWEEN :start AND :end            
            ORDER BY view_count DESC
            LIMIT 5;
            """, Object[].class)
                .setParameter("start", start)
                .setParameter("end", end)
                .getResultList();
    }

    // 대상 유형별 댓글 수 - 타입별로 카운트
    @Override
    public List<Object[]> commentTarget(LocalDateTime start, LocalDateTime end) {
        return em.createNativeQuery("""
            SELECT target_type, COUNT(*) AS comment_count
            FROM (
              SELECT\s
                CASE\s
                  WHEN cf.fileId IS NOT NULL THEN 'CONTENT'
                  WHEN b.id IS NOT NULL THEN 'BOARD'
                  ELSE 'UNKNOWN'
                END AS target_type
              FROM comment c
              LEFT JOIN contentfile cf ON c.target_id = cf.fileId
              LEFT JOIN board b ON c.target_id = b.id
              WHERE c.parent_id IS NULL
                AND c.use_tf = 'Y'
                AND c.reg_date BETWEEN :start AND :end
            ) AS sub
            GROUP BY target_type;
            """, Object[].class)
                .setParameter("start", start)
                .setParameter("end", end)
                .getResultList();
    }




}
