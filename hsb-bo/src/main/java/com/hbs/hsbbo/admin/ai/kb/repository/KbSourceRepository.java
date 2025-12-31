package com.hbs.hsbbo.admin.ai.kb.repository;

import com.hbs.hsbbo.admin.ai.kb.domain.entity.KbSource;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.*;

public interface KbSourceRepository extends JpaRepository<KbSource, Long> {
    @Query("""
       SELECT s FROM KbSource s
        WHERE s.delTf = 'N'
          AND (:siteKeyId IS NULL OR s.siteKeyId = :siteKeyId)
          AND (:useTf IS NULL OR s.useTf = :useTf)
          AND (
               :kw IS NULL
               OR TRIM(:kw) = ''
               OR LOWER(s.sourceName) LIKE LOWER(CONCAT('%', :kw, '%'))
               OR LOWER(COALESCE(s.description, '')) LIKE LOWER(CONCAT('%', :kw, '%'))
          )
       """)
    Page<KbSource> search(
            @Param("siteKeyId") Long siteKeyId,
            @Param("useTf") String useTf,     // "Y" / "N" or null
            @Param("kw") String keyword,
            Pageable pageable
    );
}
