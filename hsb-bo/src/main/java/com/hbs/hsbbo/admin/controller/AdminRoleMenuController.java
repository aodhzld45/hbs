package com.hbs.hsbbo.admin.controller;

import com.hbs.hsbbo.admin.dto.request.RoleMenuRequest;
import com.hbs.hsbbo.admin.service.AdminRoleMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
public class AdminRoleMenuController {

    private final AdminRoleMenuService adminRoleMenuService;

    @GetMapping("/{roleId}/menus")
    public ResponseEntity<List<Long>> getMenusByRole(@PathVariable Long roleId) {
        List<Long> menuIds = adminRoleMenuService.getMenuIdsByRoleId(roleId);
        return ResponseEntity.ok(menuIds);
    }

    @PutMapping("/{roleId}/menus")
    public ResponseEntity<?> updateRoleMenus(
            @PathVariable Long roleId,
            @RequestBody RoleMenuRequest request
    ) {
        adminRoleMenuService.updateRoleMenus(roleId, request.getMenuIds());
        return ResponseEntity.ok().build();
    }




}
