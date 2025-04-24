package com.hbs.hsbbo.admin.controller;

import com.hbs.hsbbo.admin.dto.request.UserRoleRequest;
import com.hbs.hsbbo.admin.dto.response.UserRoleResponse;
import com.hbs.hsbbo.admin.service.AdminRoleUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/role-user")
@RequiredArgsConstructor
public class AdminRoleUserController {

    private final AdminRoleUserService adminRoleUserService;

    @GetMapping
    public ResponseEntity<List<UserRoleResponse>> getAllUsersRoles() {
        return ResponseEntity.ok(adminRoleUserService.getAllUsersRoles());
    }

    // 모든 사용자와 그들의 권한 목록 조회
//    @GetMapping
//    public ResponseEntity<List<UserRoleResponse>> getAllUsersWithRoles() {
//        return ResponseEntity.ok(adminRoleUserService.getAllUsersWithRoles());
//    }

    // 특정 사용자에게 권한 부여
    @PutMapping
    public ResponseEntity<Void> assignRoleToUser(@RequestBody UserRoleRequest request) {
        adminRoleUserService.assignRoleToUser(request.getAdminId(), request.getRoleId());
        return ResponseEntity.ok().build();
    }

}
