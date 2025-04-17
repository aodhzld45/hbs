// src/main/java/com/hbs/hsbbo/common/repository/CodeDetailRepository.java
package com.hbs.hsbbo.common.repository;

import com.hbs.hsbbo.common.domain.entity.CodeDetail;
import com.hbs.hsbbo.common.domain.entity.CodeDetailId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CodeDetailRepository extends JpaRepository<CodeDetail, CodeDetailId> {
    List<CodeDetail> findByPcodeAndUseTfAndDelTfOrderByDcodeSeqNo(
            String pcode, String useTf, String delTf);

    @Query("select coalesce(max(c.dcodeNo), 0) from CodeDetail c where c.pcode = :pcode")
    Long findMaxDcodeNoByPcode(@Param("pcode") String pcode);
}
