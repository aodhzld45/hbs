package com.hbs.hsbbo.admin.repository;

import com.hbs.hsbbo.admin.domain.entity.PopupBanner;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PopupBannerRepository extends JpaRepository<PopupBanner, Long> {

    // 메인 노출용 배너 조회 (현재 날짜 기준)
    @Query("""
        SELECT p
        FROM PopupBanner p
        WHERE p.useTf = 'Y'
          AND p.delTf = 'N'
          AND (:now BETWEEN p.startDate AND p.endDate
               OR (p.startDate IS NULL AND p.endDate IS NULL))
        ORDER BY p.orderSeq ASC, p.id DESC
    """)
    List<PopupBanner> findVisiblePopupBanners(@Param("now") LocalDateTime now);

    @Query("""
        SELECT p
        FROM PopupBanner p
        WHERE p.delTf = 'N'
          AND (:type IS NULL OR p.type = :type)
          AND (:keyword IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
        ORDER BY p.orderSeq ASC, p.id DESC
    """)
    Page<PopupBanner> searchWithFilters(
            @Param("type") String type,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    @Query("""
    SELECT COALESCE(MAX(p.orderSeq), 0)
    FROM PopupBanner p
    WHERE p.type = :type
      AND p.delTf = 'N'
    """)
    Integer findMaxOrderSeqByType(@Param("type") String type);



}
