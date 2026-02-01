package com.hbs.hsbbo.admin.ai.kb.worker;

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

    private final KbJobRepository kbJobRepository;
    private final KbDocumentRepository kbDocumentRepository;
    private final KbSourceService kbSourceService;
    private final BrainClient brainClient;

    @Transactional
    public void runOnce() {
        // 1) READY + INGEST 1건 조회
        List<KbJob> jobs = kbJobRepository.findReadyIngestJobs(PageRequest.of(0, 1));
        if (jobs.isEmpty()) return;

        KbJob job = jobs.get(0);

        // 2) 선점: READY -> RUNNING (startedAt 세팅)
        int locked = kbJobRepository.lockJob(job.getId());
        if (locked == 0) return; // 다른 워커가 이미 잡음

        try {
            // 3) 문서 조회
            KbDocument doc = kbDocumentRepository.findById(job.getKbDocumentId())
                    .orElseThrow(() -> new IllegalStateException("KbDocument 없음: " + job.getKbDocumentId()));

            // 4) docType 별 최소 검증 (FILE/URL)
            String docType = normalize(doc.getDocType());
            if ("FILE".equals(docType) && isBlank(doc.getFilePath())) {
                fail(job, doc, "docType=FILE 인데 filePath가 비어있습니다.");
                return;
            }
            if ("URL".equals(docType) && isBlank(doc.getSourceUrl())) {
                fail(job, doc, "docType=URL 인데 sourceUrl이 비어있습니다.");
                return;
            }

            // kb_source 기준 vector_store_id 보장 + DB 저장 (예외처리 강화)
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
                return;
            }

            // document에도 디버깅/캐싱용으로
            doc.setVectorStoreId(ensuredVsId);

            // 5) Brain ingest 요청 생성
            BrainIngestRequest request = BrainIngestRequest.builder()
                    .kbJobId(job.getId())
                    .kbDocumentId(doc.getId())
                    .kbSourceId(doc.getKbSourceId())
                    .filePath(doc.getFilePath())
                    .sourceUrl(doc.getSourceUrl())
                    .docType(doc.getDocType())
                    .category(doc.getCategory())
                    .build();

            // 6) Brain 서버 호출
            BrainIngestResponse res = brainClient.ingest(request);

            // 7) 결과 반영
            if (res != null && res.isOk()) {
                // 문서에 벡터 결과 저장
                // doc.setVectorStoreId(res.getVectorStoreId()); // ❌ kb_source 기준이므로 덮지 않음
                doc.setVectorFileId(res.getVectorFileId());
                doc.setIndexedAt(LocalDateTime.now());
                doc.setIndexError(null);

                // Job 성공 처리
                job.setJobStatus(KbJobStatus.SUCCESS);
                job.setFinishedAt(LocalDateTime.now());
                job.setLastError(null);

                log.info("KbJob SUCCESS. jobId={}, docId={}, vectorStoreId={}, vectorFileId={}",
                        job.getId(), doc.getId(), ensuredVsId, res.getVectorFileId());

            } else {
                String msg = (res == null) ? "Brain ingest 응답 null"
                        : (res.getMessage() == null ? "Brain ingest 실패" : res.getMessage());
                fail(job, doc, msg);
            }

        } catch (Exception e) {
            log.error("KbJob 처리 실패. jobId={}", job.getId(), e);
            fail(job, null, e.getMessage());
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
}
