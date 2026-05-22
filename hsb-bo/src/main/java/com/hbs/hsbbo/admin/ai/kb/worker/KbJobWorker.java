package com.hbs.hsbbo.admin.ai.kb.worker;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hbs.hsbbo.admin.ai.brain.client.BrainClient;
import com.hbs.hsbbo.admin.ai.brain.dto.request.BrainDeleteIndexRequest;
import com.hbs.hsbbo.admin.ai.brain.dto.request.BrainIngestRequest;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainDeleteIndexResponse;
import com.hbs.hsbbo.admin.ai.brain.dto.response.BrainIngestResponse;
import com.hbs.hsbbo.admin.ai.kb.domain.entity.KbDocument;
import com.hbs.hsbbo.admin.ai.kb.domain.entity.KbJob;
import com.hbs.hsbbo.admin.ai.kb.domain.type.KbJobStatus;
import com.hbs.hsbbo.admin.ai.kb.domain.type.KbJobType;
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
     * Adaptive polling용: 이번 tick에서 처리할 READY job이 있었는지 반환한다.
     * - NO_JOB: READY job 없음
     * - LOCK_LOST: READY는 있었지만 다른 워커가 먼저 선점
     * - SUCCESS: 1건 처리 성공
     * - FAILED: 1건 처리 실패
     */
    @Transactional
    public WorkerResult runOnce() {
        // 삭제 작업을 먼저 조회해 soft delete 이후 벡터스토어 정리가 밀리지 않도록 한다.
        List<KbJob> jobs = kbJobRepository.findReadyJobs(
                List.of(KbJobType.DELETE_INDEX, KbJobType.INGEST),
                PageRequest.of(0, 1)
        );
        if (jobs.isEmpty()) return WorkerResult.NO_JOB;

        KbJob job = jobs.get(0);

        // READY -> RUNNING 선점. 멀티 워커 환경에서 같은 job 중복 처리를 막는다.
        int locked = kbJobRepository.lockJob(job.getId());
        if (locked == 0) return WorkerResult.LOCK_LOST;

        try {
            // soft delete 된 문서도 DELETE_INDEX 처리 대상이므로 findById로 조회한다.
            KbDocument doc = kbDocumentRepository.findById(job.getKbDocumentId())
                    .orElseThrow(() -> new IllegalStateException("KbDocument not found: " + job.getKbDocumentId()));

            if (job.getJobType() == KbJobType.DELETE_INDEX) {
                return deleteIndex(job, doc);
            }

            return ingest(job, doc);
        } catch (Exception e) {
            log.error("KbJob failed. jobId={}", job.getId(), e);
            fail(job, null, e.getMessage());
            return WorkerResult.FAILED;
        }
    }

    private WorkerResult ingest(KbJob job, KbDocument doc) throws JsonProcessingException {
        // Brain에 넘기기 전 BO 기준 최소 입력값을 먼저 검증한다.
        String docType = normalize(doc.getDocType());
        if ("FILE".equals(docType) && isBlank(doc.getFilePath())) {
            fail(job, doc, "docType=FILE but filePath is empty.");
            return WorkerResult.FAILED;
        }
        if ("URL".equals(docType) && isBlank(doc.getSourceUrl())) {
            fail(job, doc, "docType=URL but sourceUrl is empty.");
            return WorkerResult.FAILED;
        }

        final String ensuredVsId;
        try {
            // kb_source 단위 vector_store_id를 보장한 뒤 문서에도 캐싱한다.
            ensuredVsId = kbSourceService.ensureVectorStoreId(doc.getKbSourceId());
        } catch (Exception e) {
            String msg = String.format(
                    "VectorStore ensure failed. kbSourceId=%d, message=%s",
                    doc.getKbSourceId(),
                    e.getMessage()
            );
            fail(job, doc, msg);
            log.error(msg, e);
            return WorkerResult.FAILED;
        }

        doc.setVectorStoreId(ensuredVsId);

        BrainIngestRequest request = BrainIngestRequest.builder()
                .kbJobId(job.getId())
                .kbDocumentId(doc.getId())
                .kbSourceId(doc.getKbSourceId())
                .vectorStoreId(ensuredVsId)
                .filePath(doc.getFilePath())
                .sourceUrl(doc.getSourceUrl())
                .docType(doc.getDocType())
                .category(doc.getCategory())
                .summaryPrompt(doc.getSummaryPrompt())
                .build();

        BrainIngestResponse res = brainClient.ingest(request);

        // Brain ingest 성공 결과를 kb_document와 kb_job에 반영한다.
        if (res != null && res.isOk()) {
            String openaiFileId = safe(res.getOpenaiFileId());
            String vsFileId = safe(res.getVectorStoreFileId());

            if (!openaiFileId.isEmpty()) {
                doc.setVectorFileId(openaiFileId);
            } else if (!vsFileId.isEmpty()) {
                doc.setVectorFileId(vsFileId);
            }

            applyIngestMetadataToDocument(doc, res);

            job.setJobStatus(KbJobStatus.SUCCESS);
            job.setFinishedAt(LocalDateTime.now());
            job.setLastError(null);

            kbDocumentRepository.save(doc);
            kbJobRepository.save(job);

            log.info("KbJob DONE. jobId={}, docId={}, vsId={}, openaiFileId={}, vsFileId={}",
                    job.getId(), doc.getId(), ensuredVsId, openaiFileId, vsFileId);

            return WorkerResult.SUCCESS;
        }

        String msg = (res == null) ? "Brain ingest response is null"
                : (res.getMessage() == null ? "Brain ingest failed" : res.getMessage());
        fail(job, doc, msg);
        return WorkerResult.FAILED;
    }

    private WorkerResult deleteIndex(KbJob job, KbDocument doc) {
        String vectorStoreId = safe(doc.getVectorStoreId());
        String vectorFileId = safe(doc.getVectorFileId());

        // 벡터 식별자가 남아있는 경우에만 FastAPI Brain에 실제 삭제를 위임한다.
        if (!vectorStoreId.isEmpty() && !vectorFileId.isEmpty()) {
            BrainDeleteIndexResponse res = brainClient.deleteIndex(
                    BrainDeleteIndexRequest.builder()
                            .kbJobId(job.getId())
                            .kbDocumentId(doc.getId())
                            .kbSourceId(doc.getKbSourceId())
                            .vectorStoreId(vectorStoreId)
                            .vectorFileId(vectorFileId)
                            .openaiFileId(vectorFileId)
                            .build()
            );

            if (res == null || !res.isOk()) {
                String msg = (res == null) ? "Brain deleteIndex response is null"
                        : (res.getMessage() == null ? "Brain deleteIndex failed" : res.getMessage());
                fail(job, doc, msg);
                return WorkerResult.FAILED;
            }
        }

        // Brain 삭제가 끝났거나 삭제할 벡터가 없으면 BO의 인덱싱 메타데이터도 비운다.
        doc.setVectorStoreId(null);
        doc.setVectorFileId(null);
        doc.setIndexedAt(null);
        doc.setIndexSummary(null);
        doc.setIndexError(null);
        doc.setDocStatus("DELETED");

        job.setJobStatus(KbJobStatus.SUCCESS);
        job.setFinishedAt(LocalDateTime.now());
        job.setLastError(null);

        kbDocumentRepository.save(doc);
        kbJobRepository.save(job);

        log.info("KbJob DELETE_INDEX done. jobId={}, docId={}, vectorStoreId={}, vectorFileId={}",
                job.getId(), doc.getId(), vectorStoreId, vectorFileId);

        return WorkerResult.SUCCESS;
    }

    private void fail(KbJob job, KbDocument docOrNull, String msg) {
        job.setJobStatus(KbJobStatus.FAILED);
        job.setFinishedAt(LocalDateTime.now());
        job.setTryCount((job.getTryCount() == null ? 0 : job.getTryCount()) + 1);
        job.setLastError(msg);

        // 관리자 화면/디버깅에서 바로 확인할 수 있도록 문서에도 마지막 인덱싱 오류를 남긴다.
        if (docOrNull != null) {
            docOrNull.setIndexError(msg);
            docOrNull.setIndexSummary(null);
        }

        log.warn("KbJob FAILED. jobId={}, tryCount={}, msg={}",
                job.getId(), job.getTryCount(), msg);
    }

    private void applyIngestMetadataToDocument(
            KbDocument doc,
            BrainIngestResponse res
    ) throws JsonProcessingException {
        String summaryText = safe(res.getSummaryText());
        List<String> tags = res.getTags();

        String welcomeTitle = safe(res.getWelcomeTitle());
        String welcomeIntro = safe(res.getWelcomeIntro());
        List<String> welcomeQuestions = res.getWelcomeQuestions();
        List<String> welcomeKeywords = res.getWelcomeKeywords();

        doc.setIndexSummary(summaryText.isEmpty() ? null : summaryText);
        doc.setTagsJson((tags == null || tags.isEmpty()) ? null : objectMapper.writeValueAsString(tags));

        doc.setWelcomeTitle(welcomeTitle.isEmpty() ? null : welcomeTitle);
        doc.setWelcomeIntro(welcomeIntro.isEmpty() ? null : welcomeIntro);
        doc.setWelcomeQuestionsJson(
                (welcomeQuestions == null || welcomeQuestions.isEmpty())
                        ? null
                        : objectMapper.writeValueAsString(welcomeQuestions)
        );
        doc.setWelcomeKeywordsJson(
                (welcomeKeywords == null || welcomeKeywords.isEmpty())
                        ? null
                        : objectMapper.writeValueAsString(welcomeKeywords)
        );

        doc.setIndexedAt(LocalDateTime.now());
        doc.setIndexError(null);
        doc.setDocStatus("INDEXED");
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
