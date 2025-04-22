package com.hbs.hsbbo.admin.controller;


import com.hbs.hsbbo.admin.domain.entity.AdminRole;
import com.hbs.hsbbo.admin.service.AdminRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
public class AdminRoleController {

    private final AdminRoleService adminRoleService;
    
    // 관리자 그룹 목록 조회
    @GetMapping
    public List<AdminRole> getAllRoles() {
        return adminRoleService.getAllRoles();
    }
    
    // 관리자 그룹 등록
    @PostMapping
    public AdminRole createAdminRole(@RequestBody AdminRole role) {
        return adminRoleService.createAdminRole(role);
    }

    // 관리자 그룹 수정
    @PutMapping("/{id}")
    public AdminRole updateAdminRole(@PathVariable Long id, @RequestBody AdminRole updated) {
        return adminRoleService.updateAdminRole(id, updated);
    }

    // 관리자 그룹 삭제
    @PutMapping("/{id}/delete")
    public ResponseEntity<?> softDeleteAdminRole(@PathVariable Long id) {
        adminRoleService.softDeleteAdminRole(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }




}
