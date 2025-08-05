package com.hbs.hsbbo.admin.controller.page;

import com.hbs.hsbbo.admin.dto.request.page.PageSectionRequest;
import com.hbs.hsbbo.admin.dto.response.page.PageSectionListResponse;
import com.hbs.hsbbo.admin.service.page.PageSectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/page-section")
public class PageSectionController {

    private final PageSectionService pageSectionService;

    // 페이지 ID 기준 섹션 리스트 조회
    @GetMapping
    public ResponseEntity<?> getPageSectionsByPageId(
            @RequestParam Long pageId,
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String useTf
        )
    {
        try {
            PageSectionListResponse responseList = pageSectionService.getPageSectionList(pageId, keyword, page, size, useTf);
            return ResponseEntity.ok(responseList);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "리스트 조회에 실패했습니다."));
        }
    }

    // 페이지 섹션 등록
    @PostMapping
    public ResponseEntity<?> createPageSection(
            @ModelAttribute PageSectionRequest request,
            @RequestParam String adminId,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) {
        try {
            Long id = pageSectionService.createPageSection(request, adminId, files);
            return ResponseEntity.ok(id);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("페이지 섹션 등록에 실패했습니다: " + e.getMessage());
        }
    }

    // 드래그앤 드랍 순서 변경
    @PutMapping("/order")
    public ResponseEntity<Void> updateSectionOrderRaw(
            @RequestBody List<PageSectionRequest> requestList) {

        // 유효성 검증은 하지 않음
        List<PageSectionRequest> trimmedList = requestList.stream()
                .filter(r -> r.getId() != null && r.getOrderSeq() != null)
                .collect(Collectors.toList());

        pageSectionService.updateSectionOrders(trimmedList);

        return ResponseEntity.ok().build();
    }

    // 페이지 섹션 수정
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePageSection(
            @PathVariable Long id,
            @ModelAttribute PageSectionRequest request,
            @RequestParam String adminId,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) {
        try {
            Long sectionId = pageSectionService.updatePageSection(id, request, files, adminId);

            return ResponseEntity.ok(sectionId);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("페이지 섹션 수정에 실패했습니다: " + e.getMessage());
        }
    }

    // 사용여부 변경
    @PatchMapping("/{id}/use-tf")
    public ResponseEntity<Long> updateUseTf(
            @PathVariable Long id,
            @RequestParam String useTf,
            @RequestParam String adminId
    ) {
        Long response = pageSectionService.updateUseTf(id, useTf, adminId);

        return ResponseEntity.ok(response);
    }

    // 삭제 (delTf = 'N')
    @DeleteMapping("/{id}")
    public ResponseEntity<Long> deletePage(
            @PathVariable Long id,
            @RequestParam String adminId
    ) {
        Long response = pageSectionService.deletePage(id, adminId);
        return ResponseEntity.ok(response);
    }





}
