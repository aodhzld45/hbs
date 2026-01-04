package com.hbs.hsbbo.admin.ai.kb.controller;

import com.hbs.hsbbo.admin.ai.kb.dto.request.KbDocumentRequest;
import com.hbs.hsbbo.admin.ai.kb.dto.response.KbDocumentListResponse;
import com.hbs.hsbbo.admin.ai.kb.dto.response.KbDocumentResponse;
import com.hbs.hsbbo.admin.ai.kb.service.KbDocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/ai/kb-document")

public class KbDocumentController {
    private final KbDocumentService kbDocumentService;

    // 목록 조회 (검색/페이징)
    @GetMapping
    public ResponseEntity<KbDocumentListResponse> list(
            @RequestParam(value = "kbSourceId", required = false) Long kbSourceId,
            @RequestParam(value = "docType", required = false) String docType,
            @RequestParam(value = "docStatus", required = false) String docStatus,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "sort", defaultValue = "regDate,desc") String sort
    ) {
        KbDocumentListResponse body = kbDocumentService.list(
                kbSourceId, docType, docStatus, category, keyword, page, size, sort
        );
        return ResponseEntity.ok(body);
    }

    // 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<KbDocumentResponse> get(@PathVariable("id") Long id) {
        return ResponseEntity.ok(kbDocumentService.get(id));
    }

    // 등록 (multipart: body + file)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<KbDocumentResponse> create(
            @RequestParam(value = "actor") String actor,
            @RequestPart("body") @Valid KbDocumentRequest body,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        Long id = kbDocumentService.create(body, file, actor);
        return ResponseEntity.ok(kbDocumentService.get(id));
    }

    // 수정 (multipart: body + file)
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<KbDocumentResponse> update(
            @PathVariable("id") Long id,
            @RequestParam(value = "actor") String actor,
            @RequestPart("body") @Valid KbDocumentRequest body,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        Long updatedId = kbDocumentService.update(id, body, file, actor);
        return ResponseEntity.ok(kbDocumentService.get(updatedId));
    }

    // 사용 여부 토글
    @PatchMapping("/{id}/use-tf")
    public ResponseEntity<Long> toggleUse(
            @PathVariable("id") Long id,
            @RequestParam(value = "actor") String actor
    ) {
        Long updatedId = kbDocumentService.toggleUse(id, actor);
        return ResponseEntity.ok(updatedId);
    }

    // 소프트 삭제(del_tf='Y')
    @PatchMapping("/{id}/del-tf")
    public ResponseEntity<Long> delete(
            @PathVariable("id") Long id,
            @RequestParam(value = "actor") String actor
    ) {
        Long deletedId = kbDocumentService.logicalDelete(id, actor);
        return ResponseEntity.ok(deletedId);
    }
}
