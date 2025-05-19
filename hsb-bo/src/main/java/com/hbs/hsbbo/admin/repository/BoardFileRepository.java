package com.hbs.hsbbo.admin.repository;

import com.hbs.hsbbo.admin.domain.entity.BoardFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public interface BoardFileRepository extends JpaRepository<BoardFile, Long> {
    @Query("""
        SELECT DISTINCT f.board.id
        FROM BoardFile f
        WHERE f.board.id IN :boardIds AND f.delTf = 'N'
    """)
    List<Long> findBoardIdsWithFiles(@Param("boardIds") List<Long> boardIds);

    // boardId → true/false map으로 변환
    default Map<Long, Boolean> existsByBoardIds(List<Long> boardIds) {
        List<Long> existIds = findBoardIdsWithFiles(boardIds);
        return boardIds.stream()
                .collect(Collectors.toMap(id -> id, existIds::contains));
    }

    List<BoardFile> findByBoardIdAndDelTf(Long boardId, String delTf);

    void deleteByBoardId(Long boardId);

    void deleteByBoardIdAndIdNotIn(Long boardId, List<Long> ids);

}
