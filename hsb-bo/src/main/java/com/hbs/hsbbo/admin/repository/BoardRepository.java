package com.hbs.hsbbo.admin.repository;

import com.hbs.hsbbo.admin.domain.entity.Board;
import com.hbs.hsbbo.admin.domain.type.BoardType;
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

    // 활성 공지 (정렬 포함)만 조회
    @Query("""
       SELECT b FROM Board b
       WHERE b.boardType = :boardType
         AND b.delTf = 'N' AND b.useTf = 'Y'
         AND b.noticeTf = 'Y'
         AND (b.noticeStart IS NULL OR b.noticeStart <= :now)
         AND (b.noticeEnd IS NULL OR :now <= b.noticeEnd)
       ORDER BY b.noticeSeq DESC, b.id DESC
    """)
    List<Board> findActiveNotices(@Param("boardType") BoardType boardType, @Param("now") LocalDateTime now);

    /**
     * 특정 게시판 유형 + 삭제여부 + 사용여부로 전체 목록 조회
     */
    List<Board> findByBoardTypeAndDelTfAndUseTf(BoardType boardType, String delTf, String useTf);

    @Query("""
            SELECT b FROM Board b
            WHERE b.boardType = :boardType
                AND (:useTf IS NULL OR b.useTf = :useTf)
                AND b.delTf = 'N'
                AND (
                    :keyword = ''\s
                     or b.title like concat('%', :keyword, '%')\s
                     or b.content like concat('%', :keyword, '%')
                   ) 
              order by b.id desc
            """)
    Page<Board> findByBoardTypeAndKeyword(@Param("boardType") BoardType boardType,
                                          @Param("useTf") String useTf,
                                          @Param("keyword") String keyword,
                                          Pageable pageable);

    Optional<Board> findByIdAndDelTf(Long id, String delTf);

    @Modifying
    @Query("UPDATE Board b SET b.viewCount = b.viewCount + 1 WHERE b.id = :id")
    void incrementViewCount(@Param("id") Long id);


}
