package com.hbs.hsbbo.admin.repository;

import com.hbs.hsbbo.admin.domain.entity.Board;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BoardRepository extends JpaRepository<Board, Long> {

    @Query("""
       SELECT b FROM Board b
       JOIN b.boardConfig bc
       WHERE UPPER(bc.boardCode) = UPPER(:boardCode)
         AND b.delTf = 'N'
         AND b.useTf = 'Y'
         AND b.noticeTf = 'Y'
         AND (b.noticeStart IS NULL OR b.noticeStart <= :now)
         AND (b.noticeEnd IS NULL OR :now <= b.noticeEnd)
       ORDER BY b.noticeSeq DESC, b.id DESC
    """)
    List<Board> findActiveNotices(@Param("boardCode") String boardCode, @Param("now") LocalDateTime now);

    @Query("""
       SELECT b FROM Board b
       JOIN b.boardConfig bc
       WHERE UPPER(bc.boardCode) = UPPER(:boardCode)
         AND b.delTf = 'N'
         AND b.noticeTf = 'Y'
       ORDER BY b.noticeSeq DESC, b.id DESC
    """)
    List<Board> findAllNoticesForAdmin(@Param("boardCode") String boardCode);

    @Query("""
            SELECT b FROM Board b
            JOIN b.boardConfig bc
            WHERE UPPER(bc.boardCode) = UPPER(:boardCode)
              AND (:useTf IS NULL OR b.useTf = :useTf)
              AND b.delTf = 'N'
              AND b.noticeTf = 'N'
              AND (
                    :keyword = ''
                    OR b.title LIKE CONCAT('%', :keyword, '%')
                    OR b.content LIKE CONCAT('%', :keyword, '%')
                  )
            ORDER BY b.id DESC
            """)
    Page<Board> findRegularBoardsByBoardCodeAndKeyword(@Param("boardCode") String boardCode,
                                                       @Param("useTf") String useTf,
                                                       @Param("keyword") String keyword,
                                                       Pageable pageable);

    Optional<Board> findByIdAndDelTf(Long id, String delTf);

    long countByBoardConfigIdAndDelTf(Long boardConfigId, String delTf);

    @Modifying
    @Query("UPDATE Board b SET b.viewCount = b.viewCount + 1 WHERE b.id = :id")
    void incrementViewCount(@Param("id") Long id);
}
