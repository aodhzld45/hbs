package com.hbs.hsbbo.admin.ai.kb.worker;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hbs.hsbbo.admin.ai.brain.client.BrainClient;
import com.hbs.hsbbo.admin.ai.brain.dto.request.BrainIngestRequest;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainIngestResponse;
import com.hbs.hsbbo.admin.ai.kb.domain.entity.KbDocument;
import com.hbs.hsbbo.admin.ai.kb.domain.entity.KbJob;
import com.hbs.hsbbo.admin.ai.kb.domain.type.KbJobStatus;
import com.hbs.hsbbo.admin.ai.kb.repository.KbDocumentRepository;
import com.hbs.hsbbo.admin.ai.kb.repository.KbJobRepository;
import com.hbs.hsbbo.admin.ai.kb.service.KbSourceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class KbJobWorker {

    private final ObjectMapper objectMapper;
    private final KbJobRepository kbJobRepository;
    private final KbDocumentRepository kbDocumentRepository;
    private final KbSourceService kbSourceService;
    private final BrainClient brainClient;

    /**
     * Adaptive polling용: 이번 tick에서 "일이 있었는지" 결과를 반환한다.
     * - NO_JOB: READY job 없음
     * - LOCK_LOST: READY는 있었지만 선점 실패(다른 워커가 잡음)
     * - SUCCESS: 1건 처리 성공
     * - FAILED: 1건 처리 실패
     */
    @Transactional
    public WorkerResult runOnce() {
        // 1) READY + INGEST 1건 조회
        List<KbJob> jobs = kbJobRepository.findReadyIngestJobs(PageRequest.of(0, 1));
        if (jobs.isEmpty()) return WorkerResult.NO_JOB;

        KbJob job = jobs.get(0);

        // 2) 선점: READY -> RUNNING (startedAt 세팅)
        int locked = kbJobRepository.lockJob(job.getId());
        if (locked == 0) return WorkerResult.LOCK_LOST;

        try {
            // 3) 문서 조회
            KbDocument doc = kbDocumentRepository.findById(job.getKbDocumentId())
                    .orElseThrow(() -> new IllegalStateException("KbDocument 없음: " + job.getKbDocumentId()));

            // 4) docType 별 최소 검증 (FILE/URL)
            String docType = normalize(doc.getDocType());
            if ("FILE".equals(docType) && isBlank(doc.getFilePath())) {
                fail(job, doc, "docType=FILE 인데 filePath가 비어있습니다.");
                return WorkerResult.FAILED;
            }
            if ("URL".equals(docType) && isBlank(doc.getSourceUrl())) {
                fail(job, doc, "docType=URL 인데 sourceUrl이 비어있습니다.");
                return WorkerResult.FAILED;
            }

            // 5) kb_source 기준 vector_store_id 보장
            final String ensuredVsId;
            try {
                ensuredVsId = kbSourceService.ensureVectorStoreId(doc.getKbSourceId());
            } catch (Exception e) {
                String msg = String.format(
                        "VectorStore ensure 실패 (kbSourceId=%d): %s",
                        doc.getKbSourceId(),
                        e.getMessage()
                );
                fail(job, doc, msg);
                log.error(msg, e); // 스택 트레이스는 로그로만
                return WorkerResult.FAILED;
            }

            // document에도 디버깅/캐싱용으로
            doc.setVectorStoreId(ensuredVsId);

            // 6) Brain ingest 요청 생성
            BrainIngestRequest request = BrainIngestRequest.builder()
                    .kbJobId(job.getId())
                    .kbDocumentId(doc.getId())
                    .kbSourceId(doc.getKbSourceId())
                    .vectorStoreId(ensuredVsId)
                    .filePath(doc.getFilePath())
                    .sourceUrl(doc.getSourceUrl())
                    .docType(doc.getDocType())
                    .category(doc.getCategory())
                    .build();

            // 7) Brain 서버 호출
            BrainIngestResponse res = brainClient.ingest(request);

            // 8) 결과 반영
            if (res != null && res.isOk()) {
                String openaiFileId = safe(res.getOpenaiFileId());        // file_...
                String summaryText  = safe(res.getSummaryText());         // 있으면 완료
                String vsFileId     = safe(res.getVectorStoreFileId());
                List<String> tags = res.getTags();

                if (!openaiFileId.isEmpty()) {
                    doc.setVectorFileId(openaiFileId); // step2 신호
                }

                // 요약이 있으면 "완료"
                if (!summaryText.isEmpty()) {
                    doc.setIndexSummary(summaryText);
                    doc.setTagsJson((tags == null || tags.isEmpty()) ? null : objectMapper.writeValueAsString(tags));
                    doc.setIndexedAt(LocalDateTime.now());
                    doc.setIndexError(null);
                    doc.setDocStatus("INDEXED");

                    job.setJobStatus(KbJobStatus.SUCCESS); // 완료 상태
                    job.setFinishedAt(LocalDateTime.now());
                    job.setLastError(null);

                    log.info("KbJob DONE. jobId={}, docId={}, vsId={}, openaiFileId={}, vsFileId={}",
                            job.getId(), doc.getId(), ensuredVsId, openaiFileId, vsFileId);

                    return WorkerResult.SUCCESS;
                }

                // 요약이 없으면: 아직 진행중(2단계)
                doc.setIndexSummary(null);
                doc.setTagsJson(null);
                doc.setIndexError(null);
                doc.setDocStatus("INDEXING"); // READY 말고 INDEXING

                // 중요: findReadyIngestJobs가 READY만 잡는 구조라면 RUNNING으로 두면 영원히 멈춤
                job.setJobStatus(KbJobStatus.READY);
                job.setLastError(null);
                job.setTryCount((job.getTryCount() == null ? 0 : job.getTryCount()) + 1);

                // finishedAt은 찍지 않음(완료 아님)
                job.setFinishedAt(null); // 엔티티가 nullable이면. 아니라면 제거.

                log.info("KbJob RUNNING(accepted). jobId={}, docId={}, vsId={}, openaiFileId={}, vsFileId={}",
                        job.getId(), doc.getId(), ensuredVsId, openaiFileId, vsFileId);

                return WorkerResult.SUCCESS;
            } else {
                String msg = (res == null) ? "Brain ingest 응답 null"
                        : (res.getMessage() == null ? "Brain ingest 실패" : res.getMessage());
                fail(job, doc, msg);
                return WorkerResult.FAILED;
            }

        } catch (Exception e) {
            log.error("KbJob 처리 실패. jobId={}", job.getId(), e);
            fail(job, null, e.getMessage());
            return WorkerResult.FAILED;
        }
    }

    private void fail(KbJob job, KbDocument docOrNull, String msg) {
        job.setJobStatus(KbJobStatus.FAILED);
        job.setFinishedAt(LocalDateTime.now());
        job.setTryCount((job.getTryCount() == null ? 0 : job.getTryCount()) + 1);
        job.setLastError(msg);

        // 문서에도 에러 남기기(디버깅/관리자 화면에 도움)
        if (docOrNull != null) {
            docOrNull.setIndexError(msg);
            docOrNull.setIndexSummary(null);
        }

        log.warn("KbJob FAILED. jobId={}, tryCount={}, msg={}",
                job.getId(), job.getTryCount(), msg);
    }

    private String normalize(String s) {
        return (s == null) ? "" : s.trim().toUpperCase();
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private String safe(String s) {
        return (s == null) ? "" : s.trim();
    }
}
