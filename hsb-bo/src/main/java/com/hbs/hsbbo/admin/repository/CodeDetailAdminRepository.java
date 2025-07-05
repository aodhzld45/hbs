package com.hbs.hsbbo.admin.repository;

import com.hbs.hsbbo.common.domain.entity.CodeDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CodeDetailAdminRepository extends JpaRepository<CodeDetail, Long> {
    List<CodeDetail> findAllByCodeGroupIdAndDelTfOrderByOrderSeqAsc(Long codeGroupId, String delTf);
}
