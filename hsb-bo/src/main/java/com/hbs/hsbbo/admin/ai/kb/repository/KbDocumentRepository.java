package com.hbs.hsbbo.admin.ai.kb.repository;

import com.hbs.hsbbo.admin.ai.kb.domain.entity.KbDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.*;


public interface KbDocumentRepository extends JpaRepository<KbDocument, Long> {

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



