package com.hbs.hsbbo.admin.controller.page;

import com.hbs.hsbbo.admin.dto.request.page.PageRequest;
import com.hbs.hsbbo.admin.dto.response.page.PageResponse;
import com.hbs.hsbbo.admin.service.page.PageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/page")
@RequiredArgsConstructor
public class PageController {
    private final PageService pageService;

    // 페이지 등록
    @PostMapping
    public ResponseEntity<?> createPage(@ModelAttribute PageRequest request,
                                        @RequestParam String adminId) {

        Long id = pageService.createPage(request, adminId);

        return ResponseEntity.ok(id);
    }

    // 페이지 전체 리스트 불러오기
    @GetMapping
    public ResponseEntity<List<PageResponse>> getAllPages() {
        return ResponseEntity.ok(pageService.getAllPages());
    }

    // 수정
    @PutMapping("/{id}")
    public ResponseEntity<Long> updatePage(
            @PathVariable Long id,
            @ModelAttribute PageRequest request,
            @RequestParam String adminId
    ) {
        Long response = pageService.updatePage(id, request, adminId);

        return ResponseEntity.ok(response);
    }

    // 사용여부 변경
    @PutMapping("/{id}/use-tf")
    public ResponseEntity<Long> updateUseTf(
            @PathVariable Long id,
            @RequestParam String useTf,
            @RequestParam String adminId
    ) {
        Long response = pageService.updateUseTf(id, useTf, adminId);

        return ResponseEntity.ok(response);
    }

    // 삭제 (delTf = 'N')
    @DeleteMapping("/{id}")
    public ResponseEntity<Long> deletePage(
            @PathVariable Long id,
            @RequestParam String adminId
    ) {
        Long response = pageService.deletePage(id, adminId);
        return ResponseEntity.ok(response);
    }




}
