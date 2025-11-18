package com.hbs.hsbbo.admin.ai.promptprofile.controller;

import com.hbs.hsbbo.admin.ai.promptprofile.dto.request.PromptProfileRequest;
import com.hbs.hsbbo.admin.ai.promptprofile.dto.response.PromptProfileListResponse;
import com.hbs.hsbbo.admin.ai.promptprofile.dto.response.PromptProfileResponse;
import com.hbs.hsbbo.admin.ai.promptprofile.service.PromptProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
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
    @PostMapping
    public ResponseEntity<Long> create(
            @Valid @RequestBody PromptProfileRequest request,
            @RequestParam String actor
    ){
        Long id = promptProfileService.create(request, actor);
        return ResponseEntity.created(URI.create("/api/ai/prompt-profiles/" + id)).body(id);
    }

    // 수정
    @PutMapping(path = "/{id}")
    public ResponseEntity<Long> update(
            @PathVariable Long id,
            @Valid @RequestBody PromptProfileRequest request,
            @RequestParam String actor

    ) {
        Long updateId = promptProfileService.update(id, request, actor);
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
