package com.hbs.hsbbo.admin.ai.widgetconfig.repository;

import com.hbs.hsbbo.admin.ai.widgetconfig.domain.entity.WidgetConfig;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface WidgetConfigRepository extends JpaRepository<WidgetConfig, Long> {

    /** 소프트 삭제 아닌 단건 조회 */
    @Query("SELECT w FROM WidgetConfig w WHERE w.id = :id AND w.delTf = 'N'")
    Optional<WidgetConfig> findActiveById(@Param("id") Long id);

    /** 이름 중복 체크(소프트 삭제 제외) */
    boolean existsByNameAndDelTf(String name, String delTf); // 사용: existsByNameAndDelTf(name, "N")

    /** 키워드 검색 + 페이징 (name/notes LIKE, 소프트 삭제 제외) */
    @Query("""
            SELECT w FROM WidgetConfig w
             WHERE w.delTf = 'N'
               AND (:kw IS NULL OR
                    LOWER(w.name)  LIKE LOWER(CONCAT('%', :kw, '%')) OR
                    LOWER(COALESCE(w.notes, '')) LIKE LOWER(CONCAT('%', :kw, '%')))
            """)
    Page<WidgetConfig> search(@Param("kw") String keyword, Pageable pageable);

    /** 소프트 삭제 여부로 필터링 페이징 (관리 UI 등에서 전체 목록 볼 때) */
    Page<WidgetConfig> findAllByDelTf(String delTf, Pageable pageable);

    /** 일괄 조회(배치용) */
    @Query("SELECT w FROM WidgetConfig w WHERE w.id IN :ids AND w.delTf = 'N'")
    List<WidgetConfig> findAllActiveByIdIn(@Param("ids") Collection<Long> ids);

}
