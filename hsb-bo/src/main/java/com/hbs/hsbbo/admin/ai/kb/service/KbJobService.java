package com.hbs.hsbbo.admin.ai.kb.service;

import com.hbs.hsbbo.admin.ai.kb.domain.entity.KbJob;
import com.hbs.hsbbo.admin.ai.kb.domain.type.KbJobStatus;
import com.hbs.hsbbo.admin.ai.kb.domain.type.KbJobType;
import com.hbs.hsbbo.admin.ai.kb.repository.KbJobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class KbJobService {
    private final KbJobRepository kbJobRepository;

    /*
        문서 벡터화(ingest) Job을 생성
        정책: "업로드/등록 시점에는 Job만 생성" (실제 처리 = 워커/스케줄러/hsbs-brain)
    */
    public KbJob enqueueIngest(
            Long kbDocumentId,
            String payloadJson,
            String actor
    ) {
        if (kbDocumentId == null) {
            throw new IllegalArgumentException("kbDocumentId는 필수입니다.");
        }

        KbJob job = KbJob.builder()
                .kbDocumentId(kbDocumentId)
                .jobType(KbJobType.INGEST)
                .jobStatus(KbJobStatus.READY)
                .payloadJson(payloadJson)
                .tryCount(0)
                .scheduledAt(java.time.LocalDateTime.now()) // "지금 큐에 올림" 의미
                .lastError(null)
                .build();

        job.setRegAdm(actor);
        job.setUpAdm(actor);

        KbJob saved = kbJobRepository.save(job);

        log.info("[KB_JOB] enqueueIngest ok. jobId={}, kbDocumentId={}", saved.getId(), kbDocumentId);
        return saved;
    }

    /*
        문서ID로 최신 Job 조회
        UI 없이 운영해도, 로그/디버깅에 유용
     */
    @Transactional(readOnly = true)
    public java.util.Optional<KbJob> findLatestByDocumentId(Long kbDocumentId) {
        if (kbDocumentId == null) return java.util.Optional.empty();

        // Repository에 메서드 추가가 필요합니다.
        // Optional<KbJob> findTopByKbDocumentIdOrderByIdDesc(Long kbDocumentId);
        return kbJobRepository.findTopByKbDocumentIdOrderByIdDesc(kbDocumentId);
    }




}
