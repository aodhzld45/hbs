package com.hbs.hsbbo.admin.repository.page;

import com.hbs.hsbbo.admin.domain.entity.page.PageSection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PageSectionRepository extends JpaRepository<PageSection, Long> {
    // 페이지 ID -> 섹션 전체 조회 페이징 포함.
    @Query("""
    SELECT s FROM PageSection s
    WHERE s.page.id = :pageId
      AND s.delTf = 'N'
      AND (:keyword IS NULL OR s.sectionName LIKE %:keyword%)
    """)
    Page<PageSection> findByPageIdAndKeyword(@Param("pageId") Long pageId,
                                             @Param("keyword") String keyword,
                                             Pageable pageable);
}
