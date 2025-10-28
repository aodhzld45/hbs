package com.hbs.hsbbo.admin.ai.widgetconfig.controller;

import com.hbs.hsbbo.admin.ai.widgetconfig.dto.request.WidgetConfigRequest;
import com.hbs.hsbbo.admin.ai.widgetconfig.dto.response.WidgetConfigListResponse;
import com.hbs.hsbbo.admin.ai.widgetconfig.dto.response.WidgetConfigResponse;
import com.hbs.hsbbo.admin.ai.widgetconfig.service.WidgetConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;

@RestController
@RequestMapping("/api/ai/widget-configs")
@RequiredArgsConstructor
public class WidgetConfigController {

    private final WidgetConfigService widgetConfigService;

    // 목록 조회 (페이징 + 검색)
    @GetMapping
    public ResponseEntity<WidgetConfigListResponse> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "regDate,desc") String sort
    ) {
        WidgetConfigListResponse resp = widgetConfigService.list(keyword, page, size, sort);
        return ResponseEntity.ok(resp);
    }

    // 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<WidgetConfigResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(widgetConfigService.get(id));
    }

    // 생성
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Long> create(
            @Valid @RequestPart("form") WidgetConfigRequest req,
            @RequestParam String actor,
            @RequestPart(value = "iconFile", required = false) MultipartFile iconFile
    ) {
        Long id = widgetConfigService.create(req, iconFile, actor);
        return ResponseEntity.created(URI.create("/api/ai/widget-configs/" + id)).body(id);
    }

    // 수정
    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Long> update(
            @PathVariable Long id,
            @Valid @RequestPart("form") WidgetConfigRequest req,
            @RequestParam String actor,
            @RequestPart(value = "iconFile", required = false) MultipartFile iconFile

    ) {
        return ResponseEntity.ok(widgetConfigService.update(id, req, iconFile, actor));
    }

    // 사용 여부 토글(use_tf)
    @PatchMapping("/{id}/use-tf")
    public ResponseEntity<Long> toggleUse(@PathVariable Long id,
                                          @RequestParam String actor) {
        return ResponseEntity.ok(widgetConfigService.toggleUse(id, actor));
    }

    // 논리 삭제(del_tf='Y')
    @PatchMapping("/{id}/del-tf")
    public ResponseEntity<Long> logicalDelete(@PathVariable Long id,
                                              @RequestParam String actor) {
        return ResponseEntity.ok(widgetConfigService.logicalDelete(id, actor));
    }
}
