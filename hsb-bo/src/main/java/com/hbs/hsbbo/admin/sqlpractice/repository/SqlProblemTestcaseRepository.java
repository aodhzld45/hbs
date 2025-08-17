package com.hbs.hsbbo.admin.sqlpractice.repository;

import com.hbs.hsbbo.admin.sqlpractice.domain.entity.SqlProblemTestcase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SqlProblemTestcaseRepository
        extends JpaRepository<SqlProblemTestcase, Long>, JpaSpecificationExecutor<SqlProblemTestcase> {
    List<SqlProblemTestcase> findByProblem_IdOrderBySortNo(Long problemId);
}
