package com.hbs.hsbbo.admin.controller;

import com.hbs.hsbbo.admin.dto.request.PopupBannerRequest;
import com.hbs.hsbbo.admin.dto.response.PopupBannerListResponse;
import com.hbs.hsbbo.admin.dto.response.PopupBannerResponse;
import com.hbs.hsbbo.admin.service.PopupBannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/popup-banner")
public class PopupBannerController {
    @Autowired
    private final PopupBannerService popupBannerService;

    // 관리자 전체 팝업배너 목록 - 페이징 포함
    @GetMapping("/list")
    public ResponseEntity<PopupBannerListResponse> getPopupBannerList(
            @RequestParam String type,
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PopupBannerListResponse result = popupBannerService.getPopupBannerList(type, keyword, page, size);

        return ResponseEntity.ok(result);
    }

    // 메인 노출용 팝업/배너 리스트
    @GetMapping("/visible")
    public ResponseEntity<List<PopupBannerResponse>> getVisiblePopupBanners() {
        List<PopupBannerResponse> result = popupBannerService.getVisiblePopupBanners();
        return ResponseEntity.ok(result);
    }

    // 등록
    @PostMapping
    public ResponseEntity<Long> createPopupBanner(
            @ModelAttribute PopupBannerRequest request,
            @RequestParam String adminId
    ) {
        Long id = popupBannerService.createPopupBanner(request, adminId);
        return ResponseEntity.ok(id);
    }

    // 수정
    @PutMapping("/{id}")
    public ResponseEntity<Void> updatePopupBanner(
            @PathVariable Long id,
            @ModelAttribute PopupBannerRequest request,
            @RequestParam String adminId
    ) {
        popupBannerService.updatePopupBanner(id, request, adminId);
        return ResponseEntity.ok().build();
    }

    // 순서 변경
    @PutMapping("/{id}/order")
    public ResponseEntity<Void> updateBannerOrder(
            @PathVariable Long id,
            @RequestParam Integer orderSeq,
            @RequestParam String adminId
    ) {
        popupBannerService.updatePopupBannerOrder(id, orderSeq, adminId);
        return ResponseEntity.ok().build();
    }

    // 삭제 (delTf = 'N')
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePopupBanner(
            @PathVariable Long id,
            @RequestParam String adminId
    ) {
        popupBannerService.deleteBanner(id, adminId);
        return ResponseEntity.ok().build();
    }



}
