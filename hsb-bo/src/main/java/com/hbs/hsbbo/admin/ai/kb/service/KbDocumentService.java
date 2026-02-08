package com.hbs.hsbbo.admin.ai.kb.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hbs.hsbbo.admin.ai.kb.domain.entity.KbDocument;
import com.hbs.hsbbo.admin.ai.kb.domain.entity.KbJob;
import com.hbs.hsbbo.admin.ai.kb.domain.type.KbJobStatus;
import com.hbs.hsbbo.admin.ai.kb.domain.type.KbJobType;
import com.hbs.hsbbo.admin.ai.kb.dto.request.KbDocumentRequest;
import com.hbs.hsbbo.admin.ai.kb.dto.response.KbDocumentListResponse;
import com.hbs.hsbbo.admin.ai.kb.dto.response.KbDocumentResponse;
import com.hbs.hsbbo.admin.ai.kb.repository.KbDocumentRepository;
import com.hbs.hsbbo.admin.ai.kb.repository.KbJobRepository;
import com.hbs.hsbbo.common.exception.CommonException.NotFoundException;
import com.hbs.hsbbo.common.util.FileUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class KbDocumentService {
    private final KbDocumentRepository kbDocumentRepository;
    private final FileUtil fileUtil;

    private final KbJobRepository kbJobRepository;
    private final ObjectMapper objectMapper;

    // 목록
    @Transactional(readOnly = true)
    public KbDocumentListResponse list(
            Long kbSourceId,
            String docType,
            String docStatus,
            String category,
            String keyword,
            String useTf,
            int page,
            int size,
            String sort
    ) {
        Pageable pageable = buildPageable(page, size, sort);
        String use = normalizeFlag(useTf);     // "Y"/"N"/null

        Page<KbDocument> result = kbDocumentRepository.search(
                kbSourceId,
                normalize(docType),
                normalize(docStatus),
                normalize(category),
                normalize(keyword),
                use,
                pageable
        );

        List<KbDocumentResponse> items = result.getContent().stream()
                .map(KbDocumentResponse::from)
                .toList();

        return KbDocumentListResponse.of(
                items,
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    // 단건 조회
    @Transactional(readOnly = true)
    public KbDocumentResponse get(Long id) {
        KbDocument e = kbDocumentRepository.findActiveById(id)
                .orElseThrow(() -> new NotFoundException("지식 문서를 찾을 수 없습니다. id=%d", id));
        return KbDocumentResponse.from(e);
    }

    // 등록(create)
    public Long create(KbDocumentRequest request, MultipartFile file, String actor) {
        Long kbSourceId = request.getKbSourceId();
        String title = normalizeRequired(request.getTitle(), "title");
        String docType = normalizeRequired(request.getDocType(), "docType");

        // 중복 방지: kbSourceId + title
        if (kbDocumentRepository.existsByKbSourceIdAndTitleAndDelTf(kbSourceId, title, "N")) {
            throw new IllegalArgumentException("이미 존재하는 문서 제목입니다. title=" + title);
        }

        KbDocument e = new KbDocument();
        e.setKbSourceId(kbSourceId);
        e.setTitle(title);
        e.setDocType(docType);

        // 상태/버전 기본
        e.setDocStatus("READY");
        e.setVersion(request.getVersion() != null ? request.getVersion() : 1);

        // 카테고리/태그
        e.setCategory(normalize(request.getCategory()));
        e.setTagsJson(request.getTagsJson()); // JSON string 그대로

        // 파일 or URL 중 하나
        boolean fileSaved = applySingleFile(e, file);

        if (e.getFilePath() == null) {
            // 파일이 없다면 URL 문서일 수 있음
            e.setSourceUrl(normalize(request.getSourceUrl()));
        } else {
            e.setSourceUrl(null);
        }

        // (권장) docType 별 최소 검증
        if ("FILE".equalsIgnoreCase(docType) && (e.getFilePath() == null || e.getFilePath().isBlank())) {
            throw new IllegalArgumentException("FILE 문서는 파일 업로드가 필요합니다.");
        }
        if ("URL".equalsIgnoreCase(docType) && (e.getSourceUrl() == null || e.getSourceUrl().isBlank())) {
            throw new IllegalArgumentException("URL 문서는 sourceUrl이 필요합니다.");
        }

        // 인덱싱 관련 필드 초기화(생성 시점엔 아직 없음)
        resetIndexFields(e);

        // 감사필드
        e.setUseTf(flag(request.getUseTf())); // null이면 "Y"
        e.setDelTf("N");
        e.setRegAdm(actor);
        e.setUpAdm(actor);

        // 먼저 저장해서 ID 확보
        kbDocumentRepository.save(e);

        // (핵심) 비동기 인덱싱 작업(Job) 생성
        enqueueIngestJob(e, actor);

        return e.getId();
    }


    // 수정(update)
    public Long update(Long id, KbDocumentRequest request, MultipartFile file, String actor) {
        KbDocument e = kbDocumentRepository.findActiveById(id)
                .orElseThrow(() -> new NotFoundException("KB Document를 찾을 수 없습니다. id=%d", id));

        // 메타 변경 여부(벡터화 불필요)
        boolean metaChanged = false;

        // 콘텐츠 변경 여부(벡터화 필요)
        boolean contentChanged = false;

        // kbSource 이동 허용 여부: 이동 자체는 메타지만, 벡터스토어가 kb_source 기준이면 콘텐츠 재적재 필요할 수 있음
        // 정책 선택:
        // - "이동"을 허용하고 "새 vector_store에 재적재"가 필요하다면 contentChanged=true
        // - 이동만 하고 기존 벡터는 유지할거면 metaChanged=true
        if (request.getKbSourceId() != null && !request.getKbSourceId().equals(e.getKbSourceId())) {
            e.setKbSourceId(request.getKbSourceId());
            // 여기 정책 중요: kb_source 별 vector_store를 쓰므로 "재적재 필요"로 보는 게 안전
            contentChanged = true;
        }

        if (request.getTitle() != null) {
            String newTitle = normalizeRequired(request.getTitle(), "title");
            if (!newTitle.equals(e.getTitle())
                    && kbDocumentRepository.existsByKbSourceIdAndTitleAndDelTf(e.getKbSourceId(), newTitle, "N")) {
                throw new IllegalArgumentException("이미 존재하는 문서 제목입니다. title=" + newTitle);
            }
            if (!newTitle.equals(e.getTitle())) {
                e.setTitle(newTitle);
                metaChanged = true; // 제목은 메타
            }
        }

        if (request.getDocType() != null) {
            String newDocType = normalize(request.getDocType());
            if (newDocType != null && !newDocType.equalsIgnoreCase(e.getDocType())) {
                e.setDocType(newDocType);
                // docType 변경은 실제 콘텐츠 소스가 바뀌므로 재적재 필요
                contentChanged = true;
            }
        }

        if (request.getCategory() != null) {
            String newCategory = normalize(request.getCategory());
            if ((newCategory == null && e.getCategory() != null) || (newCategory != null && !newCategory.equals(e.getCategory()))) {
                e.setCategory(newCategory);
                metaChanged = true; // 카테고리는 메타
            }
        }

        if (request.getTagsJson() != null) {
            if (!request.getTagsJson().equals(e.getTagsJson())) {
                e.setTagsJson(request.getTagsJson());
                metaChanged = true; // 태그는 메타
            }
        }

        if (request.getUseTf() != null) e.setUseTf(flag(request.getUseTf()));

        // 파일 교체 시에만 콘텐츠 변경
        boolean fileReplaced = applySingleFile(e, file);
        if (fileReplaced) contentChanged = true;

        // 버전 정책: 파일 교체 시 자동 +1
        if (request.getVersion() != null) {
            e.setVersion(request.getVersion());
        } else if (fileReplaced) {
            e.setVersion(e.getVersion() + 1);
        }

        // 파일이 있으면 sourceUrl 제거, 파일이 없으면 URL 업데이트 허용
        if (e.getFilePath() != null) {
            e.setSourceUrl(null);
        } else if (request.getSourceUrl() != null) {
            String newUrl = normalize(request.getSourceUrl());
            if ((newUrl == null && e.getSourceUrl() != null) || (newUrl != null && !newUrl.equals(e.getSourceUrl()))) {
                e.setSourceUrl(newUrl);
                // URL 문서는 sourceUrl 변경이 콘텐츠 변경
                contentChanged = true;
            }
        }

        // docType 별 최소 검증
        String docType = e.getDocType();
        if ("FILE".equalsIgnoreCase(docType) && (e.getFilePath() == null || e.getFilePath().isBlank())) {
            throw new IllegalArgumentException("FILE 문서는 파일 업로드가 필요합니다.");
        }
        if ("URL".equalsIgnoreCase(docType) && (e.getSourceUrl() == null || e.getSourceUrl().isBlank())) {
            throw new IllegalArgumentException("URL 문서는 sourceUrl이 필요합니다.");
        }

        // 재인덱싱은 '콘텐츠 변경'일 때만
        if (contentChanged) {
            resetIndexFields(e);
            e.setDocStatus("INDEXING");
        }

        e.setUpAdm(actor);
        kbDocumentRepository.save(e);

        // Job enqueue도 '콘텐츠 변경'일 때만
        if (contentChanged) {
            enqueueIngestJob(e, actor);
        }

        return e.getId();
    }

    // 사용여부 토글
    public Long toggleUse(Long id, String actor) {
        KbDocument e = kbDocumentRepository.findActiveById(id)
                .orElseThrow(() -> new NotFoundException("KB Document를 찾을 수 없습니다. id=%d", id));

        e.setUseTf("Y".equals(e.getUseTf()) ? "N" : "Y");
        e.setUpAdm(actor);
        return e.getId();
    }

    // 소프트 삭제
    public Long logicalDelete(Long id, String actor) {
        KbDocument e = kbDocumentRepository.findActiveById(id)
                .orElseThrow(() -> new NotFoundException("KB Document를 찾을 수 없습니다. id=%d", id));

        e.setDelTf("Y");
        e.setDelAdm(actor);
        return e.getId();
    }

    // ----------------------------------------------------------------
    // 파일 처리
    // ----------------------------------------------------------------
    private boolean applySingleFile(KbDocument e, MultipartFile file) {
        if (file == null || file.isEmpty()) return false;

        try {
            // 0) 첨부파일 처리
            Path basePath = fileUtil.resolveContactPath("kbdocument");

            String savedPath = fileUtil.saveFile(basePath, file);

            e.setFilePath(savedPath);
            e.setOriginalFileName(file.getOriginalFilename());
            e.setFileSize(file.getSize());
            e.setMimeType(file.getContentType());

            // fileHash는 선택: FileUtil에 해시 메서드가 없다면 우선 null로 둬도 OK
            // e.setFileHash(sha256(file));  // 필요하면 구현

            return true;
        } catch (Exception ex) {
            log.error("[kb-document] file save failed. name={}", file.getOriginalFilename(), ex);
            throw new IllegalStateException("문서 파일 저장에 실패했습니다.");
        }
    }

    // ---------------------------
    // 내부 헬퍼
    // ---------------------------
    private Pageable buildPageable(int page, int size, String sort) {
        if (sort == null || sort.isBlank()) return PageRequest.of(page, size, Sort.by(Sort.Order.desc("regDate")));
        String[] p = sort.split(",");
        if (p.length == 2) {
            return PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(p[1].trim()), p[0].trim()));
        }
        return PageRequest.of(page, size, Sort.by(Sort.Order.desc("regDate")));
    }

    private String normalize(String s) {
        if (s == null || s.isBlank()) return null;
        return s.trim();
    }

    private String normalizeFlag(String s) {
        if (s == null || s.isBlank()) return null;
        String v = s.trim().toUpperCase();
        return ("Y".equals(v) || "N".equals(v)) ? v : null;
    }

    private String normalizeRequired(String s, String field) {
        String v = normalize(s);
        if (v == null) throw new IllegalArgumentException(field + " is required");
        return v;
    }

    private String defaultIfBlank(String s, String def) {
        String v = normalize(s);
        return (v == null) ? def : v;
    }

    private String flag(String s) {
        if (s == null || s.isBlank()) return "Y";
        return ("Y".equalsIgnoreCase(s.trim())) ? "Y" : "N";
    }

    private void resetIndexFields(KbDocument e) {
        e.setIndexedAt(null);
        e.setIndexSummary(null);
        e.setIndexError(null);

        // 재인덱싱이면 이전 벡터 파일 식별자는 무조건 초기화
        e.setVectorFileId(null);

        // kbSource 이동/정책에 따라 초기화
        e.setVectorStoreId(null);
    }

    private void enqueueIngestJob(KbDocument doc, String actor) {
        try {
            // 중복 INGEST job 방지 (READY/RUNNING 있으면 skip)
            boolean exists = kbJobRepository.existsByKbDocumentIdAndJobTypeAndJobStatusInAndDelTf(
                    doc.getId(),
                    KbJobType.INGEST,
                    List.of(KbJobStatus.READY, KbJobStatus.RUNNING),
                    "N"
            );
            if (exists) {
                log.info("[kb-document] ingest job already exists. docId={}", doc.getId());
                return;
            }

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("kbDocumentId", doc.getId());
            payload.put("kbSourceId", doc.getKbSourceId());
            payload.put("filePath", doc.getFilePath());
            payload.put("sourceUrl", doc.getSourceUrl());
            payload.put("docType", doc.getDocType());
            payload.put("category", doc.getCategory());

            String payloadJson = objectMapper.writeValueAsString(payload);

            KbJob job = KbJob.builder()
                    .kbDocumentId(doc.getId())
                    .jobType(KbJobType.INGEST)
                    .jobStatus(KbJobStatus.READY)
                    .payloadJson(payloadJson)
                    .tryCount(0)
                    .lastError(null)
                    .scheduledAt(LocalDateTime.now())
                    .build();

            job.setRegAdm(actor);
            job.setUpAdm(actor);

            kbJobRepository.save(job);
        } catch (Exception ex) {
            log.error("[kb-document] enqueue job failed. docId={}", doc.getId(), ex);
            throw new IllegalStateException("문서 인덱싱 작업(Job) 생성에 실패했습니다.");
        }
    }
}

