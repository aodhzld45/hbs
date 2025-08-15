package com.hbs.hsbbo.admin.sqlpractice.repository;

import com.hbs.hsbbo.admin.sqlpractice.domain.entity.SqlProblem;
import com.hbs.hsbbo.admin.sqlpractice.domain.type.ConstraintRule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

// JpaSpecificationExecutor를 붙여두면 목록 필터(키워드/레벨/태그/use_tf 등) 구현이 깔끔
public interface SqlProblemRepository
                extends JpaRepository<SqlProblem, Long>, JpaSpecificationExecutor<SqlProblem> {

    @Query("""
      SELECT p
      FROM SqlProblem p
      WHERE p.delTf = 'N'
        AND (:keyword IS NULL OR p.title LIKE CONCAT('%', :keyword, '%'))
        AND (:level IS NULL OR p.level = :level)
        AND (:rule IS NULL OR p.constraintRule = :rule)
        AND (:useTf IS NULL OR p.useTf = :useTf)
      """)
    Page<SqlProblem> search(
            @Param("keyword") String keyword,
            @Param("level") Integer level,
            @Param("rule") ConstraintRule rule,
            @Param("useTf") String useTf,
            Pageable pageable
    );

}
