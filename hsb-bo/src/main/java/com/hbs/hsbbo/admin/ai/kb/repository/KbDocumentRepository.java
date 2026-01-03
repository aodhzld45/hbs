package com.hbs.hsbbo.admin.ai.kb.repository;

import com.hbs.hsbbo.admin.ai.kb.domain.entity.KbDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;


public interface KbDocumentRepository extends JpaRepository<KbDocument, Long> {
    // 소프트 삭제 아닌 단건 조회
    @Query(
            """
            SELECT kd FROM KbDocument kd
            WHERE kd.id = :id
            AND kd.delTf = 'N'
            """
    )
    Optional<KbDocument> findActiveById(@Param("id") Long id);

    // 중복체크용
    boolean existsByKbSourceIdAndTitleAndDelTf(Long kbSourceId, String title, String delTf);

    @Query("""
           SELECT d FROM KbDocument d
            WHERE d.delTf = 'N'
              AND (:kbSourceId IS NULL OR d.kbSourceId = :kbSourceId)
              AND (:docType IS NULL OR TRIM(:docType) = '' OR d.docType = :docType)
              AND (:docStatus IS NULL OR TRIM(:docStatus) = '' OR d.docStatus = :docStatus)
              AND (:category IS NULL OR TRIM(:category) = '' OR d.category = :category)
              AND (
                   :kw IS NULL
                   OR TRIM(:kw) = ''
                   OR LOWER(d.title) LIKE LOWER(CONCAT('%', :kw, '%'))
              )
           """)
    Page<KbDocument> search(
            @Param("kbSourceId") Long kbSourceId,
            @Param("docType") String docType,
            @Param("docStatus") String docStatus,
            @Param("category") String category,
            @Param("kw") String keyword,
            Pageable pageable
    );


}



