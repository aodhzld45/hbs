package com.hbs.hsbbo.admin.controller;

import com.hbs.hsbbo.admin.service.CodeDetailAdminService;
import com.hbs.hsbbo.common.dto.request.CodeDetailRequest;
import com.hbs.hsbbo.common.dto.response.CodeDetailResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/code-details")
public class CodeDetailAdminController {

    private final CodeDetailAdminService codeDetailAdminService;

    @GetMapping("/all")
    public List<CodeDetailResponse> getAllDetails(@RequestParam Long groupId) {
        return codeDetailAdminService.getAllDetails(groupId);
    }

    @PostMapping
    public void createDetail(@RequestBody CodeDetailRequest req, String adminId) {
        codeDetailAdminService.createDetail(req, adminId);
    }

    @PutMapping("/{id}")
    public void updateDetail(@PathVariable Long id, @RequestBody CodeDetailRequest req, String adminId) {
        codeDetailAdminService.updateDetail(id, req, adminId);
    }

    @DeleteMapping("/{id}")
    public void deleteDetail(@PathVariable Long id, String adminId) {
        codeDetailAdminService.deleteDetail(id, adminId);
    }
}
