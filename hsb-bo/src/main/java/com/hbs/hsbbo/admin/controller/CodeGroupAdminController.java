package com.hbs.hsbbo.admin.controller;

import com.hbs.hsbbo.admin.aop.AdminActionLog;
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

    @AdminActionLog(action = "코드 그룹 등록", detail = "")
    @PostMapping
    public void createGroup(@RequestBody CodeGroupRequest req, @RequestParam String adminId) {
        codeGroupAdminService.createGroup(req, adminId);
    }

    @AdminActionLog(action = "코드 그룹 수정", detail = "id={id}")
    @PutMapping("/{id}")
    public void updateGroup(@PathVariable Long id, @RequestBody CodeGroupRequest req, @RequestParam String adminId) {
        codeGroupAdminService.updateGroup(id, req, adminId);
    }

    // 코드 그룹 순서 변경
    @AdminActionLog(action = "코드 그룹 순서 변경", detail = "id={id}")
    @PatchMapping("/{id}/order")
    public ResponseEntity<?> updateOrder(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> payload) {

        Integer newOrder = payload.get("orderSequence");
        codeGroupAdminService.updateOrder(id, newOrder);
        return ResponseEntity.ok().build();
    }

    @AdminActionLog(action = "코드 그룹 사용여부 변경", detail = "id={id}")
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

    @AdminActionLog(action = "코드 그룹 삭제", detail = "id={id}")
    @DeleteMapping("/{id}")
    public void deleteGroup(@PathVariable Long id, @RequestParam String adminId) {
        codeGroupAdminService.deleteGroup(id, adminId);
    }



}
