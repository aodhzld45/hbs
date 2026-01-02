package com.hbs.hsbbo.admin.ai.kb.controller;

import com.hbs.hsbbo.admin.ai.kb.dto.request.KbSourceRequest;
import com.hbs.hsbbo.admin.ai.kb.dto.response.KbSourceListResponse;
import com.hbs.hsbbo.admin.ai.kb.dto.response.KbSourceResponse;
import com.hbs.hsbbo.admin.ai.kb.service.KbSourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@Slf4j
@RequestMapping("/api/ai/kb-source")
@RequiredArgsConstructor
public class KbSourceController {
    private final KbSourceService kbSourceService;

    // 목록 조회 (키워드/필터 검색 + 페이징)
    @GetMapping
    public ResponseEntity<KbSourceListResponse> list(
            @RequestParam(required = false) Long siteKeyId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String useTf,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "regDate,desc") String sort
            ) {
        KbSourceListResponse response = kbSourceService.list(siteKeyId, keyword, useTf, page, size, sort);
        return ResponseEntity.ok(response);
    }
    // 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<KbSourceResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(kbSourceService.get(id));
    }

    // 등록
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Long> create(
            @Valid @RequestBody KbSourceRequest req,
            @RequestParam("actor") String actor

    ){
        Long id = kbSourceService.create(req, actor);

        return ResponseEntity.created(URI.create("/api/ai/kb-source/" + id)).body(id);
    }

    // 수정
    @PatchMapping("/{id}")
    public ResponseEntity<Long> update(
            @PathVariable Long id,
            @Valid @RequestBody KbSourceRequest req,
            @RequestParam String actor
    ) {
        Long updateId =  kbSourceService.update(id, req, actor);

        return ResponseEntity.ok(updateId);
    }

    // 사용여부 토글
    @PatchMapping("/{id}/use-tf")
    public ResponseEntity<Long> toggleUse(@PathVariable Long id,
                                          @RequestParam String actor) {

        Long useToggleId = kbSourceService.toggleUse(id, actor);
        return ResponseEntity.ok(useToggleId);
    }

    // 논리 삭제(del_tf='Y')
    @PatchMapping("/{id}/del-tf")
    public ResponseEntity<Long> logicalDelete(@PathVariable Long id,
                                              @RequestParam String actor) {
        Long logicalDeleteId = kbSourceService.logicalDelete(id, actor);
        return ResponseEntity.ok(logicalDeleteId);
    }



}
