package com.hbs.hsbbo.admin.repository;

import com.hbs.hsbbo.common.domain.entity.CodeGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CodeGroupAdminRepository extends JpaRepository<CodeGroup, Long> {
    @Query("SELECT MAX(c.orderSeq) FROM CodeGroup c WHERE c.delTf = 'N'")
    Integer findMaxOrderSeq();

    @Modifying
    @Query("UPDATE CodeGroup c " +
            "SET c.orderSeq = c.orderSeq + 1 " +
            "WHERE c.orderSeq BETWEEN :start AND :end AND c.delTf = 'N'")
    void incrementOrderBetween(@Param("start") int start, @Param("end") int end);

    @Modifying
    @Query("UPDATE CodeGroup c " +
            "SET c.orderSeq = c.orderSeq - 1 " +
            "WHERE c.orderSeq BETWEEN :start AND :end AND c.delTf = 'N'")
    void decrementOrderBetween(@Param("start") int start, @Param("end") int end);
}
