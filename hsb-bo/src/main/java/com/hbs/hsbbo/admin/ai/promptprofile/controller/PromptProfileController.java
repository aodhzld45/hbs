package com.hbs.hsbbo.admin.ai.promptprofile.controller;

import com.hbs.hsbbo.admin.ai.promptprofile.dto.request.PromptProfileRequest;
import com.hbs.hsbbo.admin.ai.promptprofile.dto.response.PromptProfileListResponse;
import com.hbs.hsbbo.admin.ai.promptprofile.dto.response.PromptProfileResponse;
import com.hbs.hsbbo.admin.ai.promptprofile.service.PromptProfileService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;

@RestController
@Slf4j
@RequestMapping("/api/ai/prompt-profiles")
@RequiredArgsConstructor
public class PromptProfileController {
    private final PromptProfileService promptProfileService;

    // 목록 조회 (키워드/모델 검색 + 페이징)
    @GetMapping
    public ResponseEntity<PromptProfileListResponse> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String model,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "regDate,desc") String sort
    ) {
        PromptProfileListResponse response = promptProfileService.list(keyword, model, page, size, sort);
        return ResponseEntity.ok(response);
    }

    // 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<PromptProfileResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(promptProfileService.get(id));
    }

    // 등록
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Long> create(
            @Valid @RequestPart("body") PromptProfileRequest body,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @RequestParam("actor") String actor,
            HttpServletRequest request

    ){
        log.info("contentType={}", request.getContentType());
        log.info("files size={}", files == null ? 0 : files.size());

        Long id = promptProfileService.create(body, files, actor);

        return ResponseEntity.created(URI.create("/api/ai/prompt-profiles/" + id)).body(id);
    }

    // 수정
    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Long> update(
            @PathVariable Long id,
            @Valid @RequestPart("body") PromptProfileRequest body,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @RequestParam("actor") String actor,
            HttpServletRequest request

    ) {
        log.info("contentType={}", request.getContentType());
        log.info("files size={}", files == null ? 0 : files.size());

        Long updateId = promptProfileService.update(id, body, files, actor);
        return ResponseEntity.ok(updateId);
    }

    // 사용여부 토글
    @PatchMapping("/{id}/use-tf")
    public ResponseEntity<Long> toggleUse(@PathVariable Long id,
                                          @RequestParam String actor) {

        Long useToggleId = promptProfileService.toggleUse(id, actor);
        return ResponseEntity.ok(useToggleId);
    }

    // 논리 삭제(del_tf='Y')
    @PatchMapping("/{id}/del-tf")
    public ResponseEntity<Long> logicalDelete(@PathVariable Long id,
                                              @RequestParam String actor) {
        Long logicalDeleteId = promptProfileService.logicalDelete(id, actor);
        return ResponseEntity.ok(logicalDeleteId);
    }
}
