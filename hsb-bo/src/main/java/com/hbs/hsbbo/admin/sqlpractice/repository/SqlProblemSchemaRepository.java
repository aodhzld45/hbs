package com.hbs.hsbbo.admin.sqlpractice.repository;

import com.hbs.hsbbo.admin.sqlpractice.domain.entity.SqlProblemSchema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SqlProblemSchemaRepository
        extends JpaRepository<SqlProblemSchema, Long>, JpaSpecificationExecutor<SqlProblemSchema> {
    Optional<SqlProblemSchema> findByProblem_Id(Long problemId);
}
