package com.hbs.hsbbo.admin.repository.page;

import com.hbs.hsbbo.admin.domain.entity.page.PageSection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PageSectionRepository extends JpaRepository<PageSection, Long> {
    // 관리자용 전체 섹션 조회 (use_tf 관계없이 del_tf = 'N')
    @Query("""
    SELECT s FROM PageSection s
    WHERE s.page.id = :pageId
      AND s.delTf = 'N'
      AND (:keyword IS NULL OR s.sectionName LIKE %:keyword%)
    """)
    Page<PageSection> findByPageIdAndKeyword(@Param("pageId") Long pageId,
                                             @Param("keyword") String keyword,
                                             Pageable pageable);

    // 사용자용 활성 섹션 조회 (use_tf = 'Y' AND del_tf = 'N')
    @Query("""
    SELECT s FROM PageSection s
    WHERE s.page.id = :pageId
      AND s.delTf = 'N'
      AND s.useTf = 'Y'
      AND (:keyword IS NULL OR s.sectionName LIKE %:keyword%)
    """)
    Page<PageSection> findByPageIdAndUseTfAndKeyword(@Param("pageId") Long pageId,
                                                     @Param("keyword") String keyword,
                                                     Pageable pageable);
}


