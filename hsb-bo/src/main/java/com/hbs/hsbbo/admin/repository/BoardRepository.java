package com.hbs.hsbbo.admin.repository;

import com.hbs.hsbbo.admin.domain.entity.Board;
import com.hbs.hsbbo.admin.domain.type.BoardType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface BoardRepository extends JpaRepository<Board, Long> {

    @Query("""
        SELECT b FROM Board b
        WHERE b.boardType = :boardType
          AND b.delTf = 'N'
          AND (:keyword IS NULL OR b.title LIKE %:keyword%)
    """)
    Page<Board> findByBoardTypeAndKeyword(@Param("boardType") BoardType boardType,
                                          @Param("keyword") String keyword,
                                          Pageable pageable);

    Optional<Board> findByIdAndDelTf(Long id, String delTf);

    @Modifying
    @Query("UPDATE Board b SET b.viewCount = b.viewCount + 1 WHERE b.id = :id")
    void incrementViewCount(@Param("id") Long id);


}
