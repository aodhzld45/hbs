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
    public ResponseEntity<List<UserRoleResponse>> getAllUsersWithRoles() {
        return ResponseEntity.ok(adminRoleUserService.getAllUsersWithRoles());
    }

    @PutMapping
    public ResponseEntity<Void> assignRoleToUser(@RequestBody UserRoleRequest request) {
        adminRoleUserService.assignRoleToUser(request.getAdminId(), request.getRoleId());
        return ResponseEntity.ok().build();
    }

}
