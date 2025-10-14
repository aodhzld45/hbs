package com.hbs.hsbbo.admin.ai.sitekey.controller;

import com.hbs.hsbbo.admin.ai.sitekey.domain.entity.SiteKey;
import com.hbs.hsbbo.admin.ai.sitekey.dto.PagedResponse;
import com.hbs.hsbbo.admin.ai.sitekey.dto.request.SiteKeyCreateRequest;
import com.hbs.hsbbo.admin.ai.sitekey.dto.request.SiteKeyQuery;
import com.hbs.hsbbo.admin.ai.sitekey.dto.request.SiteKeyStatusRequest;
import com.hbs.hsbbo.admin.ai.sitekey.dto.request.SiteKeyUpdateRequest;
import com.hbs.hsbbo.admin.ai.sitekey.dto.response.SiteKeyResponse;
import com.hbs.hsbbo.admin.ai.sitekey.dto.response.SiteKeySummaryResponse;
import com.hbs.hsbbo.admin.ai.sitekey.service.SiteKeyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai/site-keys")
@RequiredArgsConstructor
public class SiteKeyController {

    private final SiteKeyService siteKeyService;

    //  사이트 키 등록
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SiteKeyResponse create(
            @Valid @RequestBody SiteKeyCreateRequest req,
            @RequestParam String actor) {

        SiteKeyResponse response = siteKeyService.create(req, actor);

        return response;
    }

    // 사이트 키 수정
    @PatchMapping("/{id}")
    public SiteKeyResponse update(
            @PathVariable Long id,
            @Valid @RequestBody SiteKeyUpdateRequest req,
            @RequestParam String actor
            ) {
        SiteKeyResponse response =  siteKeyService.update(id, req, actor);

        return response;
    }

    // 간단 상태 변경
    @PatchMapping("/{id}/status")
    public SiteKeyResponse changeStatus(
            @PathVariable Long id,
            @Valid @RequestBody SiteKeyStatusRequest req,
            @RequestParam String actor
            ) {
        SiteKeyResponse response = siteKeyService.changeStatus(id, req, actor);

        return  response;
    }

    // SiteKey 상세 조회
    @GetMapping("/{id}")
    public SiteKeyResponse get(@PathVariable Long id) {
        SiteKeyResponse response = siteKeyService.get(id);
        return  response;
    }

    @GetMapping("/by-key/{siteKey}")
    public SiteKeyResponse getByKey(@PathVariable String siteKey) {
        return siteKeyService.getBySiteKey(siteKey);
    }

    // 목록 조회 - 페이징 포함
    @GetMapping
    public PagedResponse<SiteKeySummaryResponse> list(
            @Valid SiteKeyQuery query) {
        return siteKeyService.search(query);
    }

    // 선택: 런타임 검증
    @PostMapping("/verify")
    public Map<String, Object> verify(@RequestBody Map<String, String> body) {
        String siteKey = body.get("siteKey");
        String clientDomain = body.get("clientDomain");
        SiteKey sk = siteKeyService.assertActiveAndDomainAllowed(siteKey, clientDomain);
        return Map.of("ok", true, "status", sk.getStatus().name());
    }

}
