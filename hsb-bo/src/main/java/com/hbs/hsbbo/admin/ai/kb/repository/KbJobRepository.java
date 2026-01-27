package com.hbs.hsbbo.admin.ai.kb.repository;

import com.hbs.hsbbo.admin.ai.kb.domain.entity.KbJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface KbJobRepository extends JpaRepository<KbJob, Long> {
    Optional<KbJob> findTopByKbDocumentIdOrderByIdDesc(Long kbDocumentId);

}
