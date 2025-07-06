package com.hbs.hsbbo.admin.controller;

import com.hbs.hsbbo.admin.service.CodeGroupAdminService;
import com.hbs.hsbbo.common.dto.request.CodeGroupRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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

    // 코드 그룹 순서 변경
    @PatchMapping("/{id}/order")
    public ResponseEntity<?> updateOrder(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> payload) {

        Integer newOrder = payload.get("orderSequence");
        codeGroupAdminService.updateOrder(id, newOrder);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/use-tf")
    public ResponseEntity<Void> updateGroupUseTf(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            @RequestParam String adminId
    ) {
        String useTf = payload.get("useTf");
        codeGroupAdminService.updateGroupUseTf(id, useTf, adminId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public void deleteGroup(@PathVariable Long id, String adminId) {
        codeGroupAdminService.deleteGroup(id, adminId);
    }



}
