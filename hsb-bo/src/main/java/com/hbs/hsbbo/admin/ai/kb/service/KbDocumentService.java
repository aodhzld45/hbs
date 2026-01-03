package com.hbs.hsbbo.admin.ai.kb.service;

import com.hbs.hsbbo.admin.ai.kb.domain.entity.KbDocument;
import com.hbs.hsbbo.admin.ai.kb.dto.request.KbDocumentRequest;
import com.hbs.hsbbo.admin.ai.kb.dto.response.KbDocumentListResponse;
import com.hbs.hsbbo.admin.ai.kb.dto.response.KbDocumentResponse;
import com.hbs.hsbbo.admin.ai.kb.repository.KbDocumentRepository;
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
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class KbDocumentService {
    private final KbDocumentRepository kbDocumentRepository;
    private final FileUtil fileUtil;

    // 목록
    @Transactional(readOnly = true)
    public KbDocumentListResponse list(
            Long kbSourceId,
            String docType,
            String docStatus,
            String category,
            String keyword,
            int page,
            int size,
            String sort
    ) {
        Pageable pageable = buildPageable(page, size, sort);

        Page<KbDocument> result = kbDocumentRepository.search(
                kbSourceId,
                normalize(docType),
                normalize(docStatus),
                normalize(category),
                normalize(keyword),
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
        e.setDocStatus(defaultIfBlank(request.getDocStatus(), "READY"));
        e.setVersion(request.getVersion() != null ? request.getVersion() : 1);

        // 카테고리/태그
        e.setCategory(normalize(request.getCategory()));
        e.setTagsJson(request.getTagsJson()); // JSON string 그대로

        // 파일 or URL 중 하나
        applySingleFile(e, file);
        if (e.getFilePath() == null) {
            // 파일이 없다면 URL 문서일 수 있음
            e.setSourceUrl(normalize(request.getSourceUrl()));
        } else {
            e.setSourceUrl(null);
        }

        // 감사필드
        e.setUseTf(flag(request.getUseTf())); // null이면 "Y"
        e.setDelTf("N");
        e.setRegAdm(actor);

        kbDocumentRepository.save(e);
        return e.getId();
    }

    // 수정(update)
    public Long update(Long id, KbDocumentRequest request, MultipartFile file, String actor) {
        KbDocument e = kbDocumentRepository.findActiveById(id)
                .orElseThrow(() -> new NotFoundException("KB Document를 찾을 수 없습니다. id=%d", id));

        // kbSource 이동 허용 여부: 정책에 따라 (여기선 허용)
        if (request.getKbSourceId() != null && !request.getKbSourceId().equals(e.getKbSourceId())) {
            e.setKbSourceId(request.getKbSourceId());
        }

        if (request.getTitle() != null) {
            String newTitle = normalizeRequired(request.getTitle(), "title");
            if (!newTitle.equals(e.getTitle())
                    && kbDocumentRepository.existsByKbSourceIdAndTitleAndDelTf(e.getKbSourceId(), newTitle, "N")) {
                throw new IllegalArgumentException("이미 존재하는 문서 제목입니다. title=" + newTitle);
            }
            e.setTitle(newTitle);
        }

        if (request.getDocType() != null) e.setDocType(normalize(request.getDocType()));
        if (request.getDocStatus() != null) e.setDocStatus(normalize(request.getDocStatus()));
        if (request.getCategory() != null) e.setCategory(normalize(request.getCategory()));
        if (request.getTagsJson() != null) e.setTagsJson(request.getTagsJson());
        if (request.getUseTf() != null) e.setUseTf(flag(request.getUseTf()));

        // 파일이 들어오면 교체(단일)
        boolean fileReplaced = applySingleFile(e, file);

        // 버전 정책: 파일 교체 시 자동 +1
        if (request.getVersion() != null) {
            e.setVersion(request.getVersion());
        } else if (fileReplaced) {
            e.setVersion(e.getVersion() + 1);
        }

        // 파일이 있으면 sourceUrl은 제거, 파일이 없으면 URL 업데이트 허용
        if (e.getFilePath() != null) {
            e.setSourceUrl(null);
        } else if (request.getSourceUrl() != null) {
            e.setSourceUrl(normalize(request.getSourceUrl()));
        }

        e.setUpAdm(actor);
        kbDocumentRepository.save(e);
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
}

