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

    @PostMapping
    public ResponseEntity<?> createPage(@ModelAttribute PageRequest request,
                                        @RequestParam String adminId) {

        Long id = pageService.createPage(request, adminId);

        return ResponseEntity.ok(id);
    }

    @GetMapping
    public ResponseEntity<List<PageResponse>> getAllPages() {
        return ResponseEntity.ok(pageService.getAllPages());
    }





}
