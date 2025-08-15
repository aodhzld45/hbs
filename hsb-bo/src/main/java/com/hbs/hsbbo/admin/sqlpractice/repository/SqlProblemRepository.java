package com.hbs.hsbbo.admin.sqlpractice.repository;

import com.hbs.hsbbo.admin.sqlpractice.domain.entity.SqlProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

// JpaSpecificationExecutor를 붙여두면 목록 필터(키워드/레벨/태그/use_tf 등) 구현이 깔끔
public interface SqlProblemRepository
                extends JpaRepository<SqlProblem, Long>, JpaSpecificationExecutor<SqlProblem> {

}
