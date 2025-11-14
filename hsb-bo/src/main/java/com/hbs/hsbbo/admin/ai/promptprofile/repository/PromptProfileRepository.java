package com.hbs.hsbbo.admin.ai.promptprofile.repository;

import com.hbs.hsbbo.admin.ai.promptprofile.domain.entity.PromptProfile;
import com.hbs.hsbbo.admin.ai.promptprofile.domain.type.PromptStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PromptProfileRepository extends JpaRepository<PromptProfile, Long> {
    /** 소프트 삭제 아닌 단건 조회 */
    @Query("""
           SELECT p FROM PromptProfile p
            WHERE p.id = :id
              AND p.delTf = 'N'
           """)
    Optional<PromptProfile> findActiveById(@Param("id") Long id);

    /**
     * 키워드 + 필터 검색 + 페이징
     *
     * - delTf = 'N' (소프트 삭제 제외)
     * - tenantId: null 이면 전체, 아니면 해당 테넌트만
     * - status: null 이면 전체, 아니면 해당 상태만
     * - model: null 이면 전체, 아니면 해당 모델만
     * - keyword(kw): null/빈값이면 전체,
     *   있으면 name / purpose / model / systemTpl / guardrailTpl 에 LIKE 검색
     */
    @Query("""
           SELECT p FROM PromptProfile p
            WHERE p.delTf = 'N'
              AND (:tenantId IS NULL OR p.tenantId = :tenantId)
              AND (:status IS NULL OR p.status = :status)
              AND (:model IS NULL OR p.model = :model)
              AND (
                   :kw IS NULL
                   OR TRIM(:kw) = ''
                   OR LOWER(p.name) LIKE LOWER(CONCAT('%', :kw, '%'))
                   OR LOWER(COALESCE(p.purpose, '')) LIKE LOWER(CONCAT('%', :kw, '%'))
                   OR LOWER(p.model) LIKE LOWER(CONCAT('%', :kw, '%'))
              )
           """)
    Page<PromptProfile> search(
            @Param("tenantId") String tenantId,
            @Param("status") PromptStatus status,
            @Param("model") String model,
            @Param("kw") String keyword,
            Pageable pageable
    );
}
