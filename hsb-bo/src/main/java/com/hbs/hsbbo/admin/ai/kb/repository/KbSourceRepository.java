package com.hbs.hsbbo.admin.ai.kb.repository;

import com.hbs.hsbbo.admin.ai.kb.domain.entity.KbSource;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface KbSourceRepository extends JpaRepository<KbSource, Long> {
    // 소프트 삭제 아닌 단건 조회
    @Query(
            """
            SELECT ks FROM KbSource ks
            WHERE ks.id = :id
            AND ks.delTf = 'N'
            """
    )
    Optional<KbSource> findActiveById(@Param("id") Long id);

    // PESSIMISTIC_WRITE로 동시에 두 개가 생성 요청 들어와도 하나만 생성
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from KbSource s where s.id = :id")
    Optional<KbSource> findByIdForUpdate(@Param("id") Long id);

    // 중복체크용
    boolean existsBySiteKeyIdAndSourceNameAndDelTf(Long siteKeyId, String name, String delTf);

    // 키워드 + 필터 검색 + 페이징
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
