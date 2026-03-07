package com.hbs.hsbbo.admin.repository;

import com.hbs.hsbbo.admin.domain.entity.BoardConfig;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface BoardConfigRepository extends JpaRepository<BoardConfig, Long> {

    @Query("""
            SELECT bc FROM BoardConfig bc
            WHERE bc.delTf = 'N'
              AND (:useTf IS NULL OR bc.useTf = :useTf)
              AND (
                    :keyword = ''
                    OR UPPER(bc.boardCode) LIKE CONCAT('%', UPPER(:keyword), '%')
                    OR bc.boardName LIKE CONCAT('%', :keyword, '%')
                    OR COALESCE(bc.boardDesc, '') LIKE CONCAT('%', :keyword, '%')
                  )
            ORDER BY bc.sortSeq ASC, bc.id DESC
            """)
    Page<BoardConfig> searchWithFilters(@Param("keyword") String keyword,
                                        @Param("useTf") String useTf,
                                        Pageable pageable);

    Optional<BoardConfig> findByIdAndDelTf(Long id, String delTf);

    Optional<BoardConfig> findByBoardCodeIgnoreCaseAndDelTf(String boardCode, String delTf);

    boolean existsByBoardCodeIgnoreCase(String boardCode);

    boolean existsByBoardCodeIgnoreCaseAndIdNot(String boardCode, Long id);
}
