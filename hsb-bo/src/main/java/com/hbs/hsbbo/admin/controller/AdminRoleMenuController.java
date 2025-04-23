package com.hbs.hsbbo.admin.controller;

import com.hbs.hsbbo.admin.dto.request.RoleMenuRequest;
import com.hbs.hsbbo.admin.dto.response.RoleMenuResponse;
import com.hbs.hsbbo.admin.service.AdminRoleMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
public class AdminRoleMenuController {

    private final AdminRoleMenuService adminRoleMenuService;

    // 1. 특정 권한 그룹(roleId)에 연결된 메뉴 권한 목록 조회
    @GetMapping("/{roleId}/menus")
    public ResponseEntity<RoleMenuResponse> getMenusByRole(@PathVariable Long roleId) {
        RoleMenuResponse response = adminRoleMenuService.getRoleMenuPermissions(roleId);

        return ResponseEntity.ok(response);
    }

    // 2. 특정 권한 그룹(roleId)에 대해 메뉴 권한을 수정
    @PutMapping("/{roleId}/menus")
    public ResponseEntity<?> updateRoleMenus(
            @PathVariable Long roleId,
            @RequestBody RoleMenuRequest request
    ) {
        adminRoleMenuService.updateRoleMenus(roleId, request.getMenuPermissions());
        return ResponseEntity.ok().build();
    }






}
