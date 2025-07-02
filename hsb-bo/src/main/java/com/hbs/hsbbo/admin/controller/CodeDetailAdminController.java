package com.hbs.hsbbo.admin.controller;

import com.hbs.hsbbo.admin.service.CodeDetailAdminService;
import com.hbs.hsbbo.common.dto.request.CodeDetailRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/code-details")
public class CodeDetailAdminController {

    private final CodeDetailAdminService codeDetailAdminService;

    @PostMapping
    public void createDetail(@RequestBody CodeDetailRequest req, String adminId) {
        codeDetailAdminService.createDetail(req, adminId);
    }

    @PutMapping("/{id}")
    public void updateDetail(@PathVariable String id, @RequestBody CodeDetailRequest req, String adminId) {
        codeDetailAdminService.updateDetail(id, req, adminId);
    }

    @DeleteMapping("/{id}")
    public void deleteDetail(@PathVariable String id, String adminId) {
        codeDetailAdminService.deleteDetail(id, adminId);
    }
}
