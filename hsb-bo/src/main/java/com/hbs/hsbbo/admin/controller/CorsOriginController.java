package com.hbs.hsbbo.admin.controller;

import com.hbs.hsbbo.admin.domain.entity.AppCorsOrigin;
import com.hbs.hsbbo.admin.dto.request.CorsOriginRequest;
import com.hbs.hsbbo.admin.service.CorsOriginService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/admin/cors-origins")
@RequiredArgsConstructor
@Validated
public class CorsOriginController {

    private final CorsOriginService corsOriginService;

    // 조회
    /** 활성 전체 (관리 UI 드롭다운 등) */
    @GetMapping("/active")
    public ResponseEntity<List<AppCorsOrigin>> findAllActive() {
        return ResponseEntity.ok(corsOriginService.findAllActive());
    }

    /** 테넌트별 활성 전체 */
    @GetMapping("/active/by-tenant")
    public ResponseEntity<List<AppCorsOrigin>> findAllActiveByTenant(
            @RequestParam(required = false) String tenantId
    ) {
        return ResponseEntity.ok(corsOriginService.findAllActiveByTenant(tenantId));
    }

    /** 활성 단건 조회 */
    @GetMapping("/{id}")
    public ResponseEntity<AppCorsOrigin> findActiveById(@PathVariable Long id) {
        return ResponseEntity.ok(corsOriginService.findActiveById(id));
    }

    /** 검색 + 페이지 */
    @GetMapping
    public ResponseEntity<Page<AppCorsOrigin>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String useTf,      // 'Y'/'N' 또는 null
            @RequestParam(required = false) String tenantId,
            @PageableDefault(sort = "regDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(corsOriginService.search(keyword, useTf, tenantId, pageable));
    }

    /** 생성 */
    @PostMapping
    public ResponseEntity<IdResponse> create(
            @Valid @RequestBody CorsOriginRequest req,
            @RequestParam String actor
    ) {
        Long id = corsOriginService.create(req, actor);
        return ResponseEntity.created(URI.create("/api/admin/cors-origins/" + id))
                .body(new IdResponse(id));
    }

    /** 수정 */
    @PatchMapping("/{id}")
    public ResponseEntity<IdResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CorsOriginRequest req,
            @RequestParam String actor
    ) {
        Long updatedId = corsOriginService.update(id, req, actor);
        return ResponseEntity.ok(new IdResponse(updatedId));
    }

    /** 사용 여부 변경 (Y/N) */
    @PatchMapping("/{id}/use-tf")
    public ResponseEntity<IdResponse> updateUseTf(
            @PathVariable Long id,
            @RequestParam String newUseTf,   // 'Y' 또는 'N'
            @RequestParam String actor
    ) {
        Long updatedId = corsOriginService.updateUseTf(id, newUseTf, actor);
        return ResponseEntity.ok(new IdResponse(updatedId));
    }

    /** 소프트 삭제 (delTf = 'Y') */
    @PatchMapping("/{id}/del-tf")
    public ResponseEntity<IdResponse> softDelete(
            @PathVariable Long id,
            @RequestParam String actor
    ) {
        Long deletedId = corsOriginService.deleteAppCorsOrigin(id, actor);
        return ResponseEntity.ok(new IdResponse(deletedId));
    }

    public record IdResponse(Long id) {}

}
