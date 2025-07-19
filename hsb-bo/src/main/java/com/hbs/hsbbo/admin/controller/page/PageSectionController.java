package com.hbs.hsbbo.admin.controller.page;

import com.hbs.hsbbo.admin.dto.request.page.PageSectionRequest;
import com.hbs.hsbbo.admin.service.page.PageSectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/page-section")
public class PageSectionController {

    private final PageSectionService pageSectionService;

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

}
