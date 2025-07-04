package com.hbs.hsbbo.admin.controller;

import com.hbs.hsbbo.admin.service.CodeGroupAdminService;
import com.hbs.hsbbo.common.dto.request.CodeGroupRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/code-groups")
public class CodeGroupAdminController {

    private final CodeGroupAdminService codeGroupAdminService;

    @PostMapping
    public void createGroup(@RequestBody CodeGroupRequest req, String adminId) {
        codeGroupAdminService.createGroup(req, adminId);
    }

    @PutMapping("/{id}")
    public void updateGroup(@PathVariable Long id, @RequestBody CodeGroupRequest req, String adminId) {
        codeGroupAdminService.updateGroup(id, req, adminId);
    }

    @DeleteMapping("/{id}")
    public void deleteGroup(@PathVariable Long id, String adminId) {
        codeGroupAdminService.deleteGroup(id, adminId);
    }



}
