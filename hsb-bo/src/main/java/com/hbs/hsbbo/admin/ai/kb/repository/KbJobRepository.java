package com.hbs.hsbbo.admin.ai.kb.repository;

import com.hbs.hsbbo.admin.ai.kb.domain.entity.KbJob;
import com.hbs.hsbbo.admin.ai.kb.domain.type.KbJobStatus;
import com.hbs.hsbbo.admin.ai.kb.domain.type.KbJobType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface KbJobRepository extends JpaRepository<KbJob, Long> {
    Optional<KbJob> findTopByKbDocumentIdOrderByIdDesc(Long kbDocumentId);

    boolean existsByKbDocumentIdAndJobTypeAndJobStatusInAndDelTf(
            Long kbDocumentId, KbJobType jobType, List<KbJobStatus> statuses, String delTf
    );

    @Modifying
    @Query("""
        update KbJob j
           set j.jobStatus = com.hbs.hsbbo.admin.ai.kb.domain.type.KbJobStatus.RUNNING,
               j.startedAt = CURRENT_TIMESTAMP
         where j.id = :id
           and j.jobStatus = com.hbs.hsbbo.admin.ai.kb.domain.type.KbJobStatus.READY
    """)
    int lockJob(@Param("id") Long id);

    @Query("""
        select j
          from KbJob j
         where j.jobStatus = com.hbs.hsbbo.admin.ai.kb.domain.type.KbJobStatus.READY
           and j.jobType = com.hbs.hsbbo.admin.ai.kb.domain.type.KbJobType.INGEST
           and j.delTf = 'N'
           and j.useTf = 'Y'
         order by j.regDate asc
    """)
    List<KbJob> findReadyIngestJobs(Pageable pageable);

}
