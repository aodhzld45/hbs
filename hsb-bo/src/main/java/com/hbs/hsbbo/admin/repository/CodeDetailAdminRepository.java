package com.hbs.hsbbo.admin.repository;

import com.hbs.hsbbo.common.domain.entity.CodeDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CodeDetailAdminRepository extends JpaRepository<CodeDetail, Long> {
    @Query("""
            SELECT MAX(c.orderSeq)
            FROM CodeDetail c
            WHERE c.delTf = 'N'
              AND c.codeGroup.id = :groupId
              AND (
                    (:parentCodeId IS NULL AND c.parentCodeId IS NULL)
                    OR
                    (:parentCodeId IS NOT NULL AND c.parentCodeId = :parentCodeId)
                  )
        """
    )
    Integer findMaxOrderSeqByGroupAndParent(
            @Param("groupId") Long groupId,
            @Param("parentCodeId") String parentCodeId
    );
    List<CodeDetail> findAllByCodeGroupIdAndDelTfOrderByOrderSeqAsc(Long codeGroupId, String delTf);
}
