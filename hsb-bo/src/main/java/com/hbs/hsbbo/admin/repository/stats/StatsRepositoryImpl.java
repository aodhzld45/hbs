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


}
