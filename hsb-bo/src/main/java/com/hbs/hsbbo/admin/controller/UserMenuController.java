package com.hbs.hsbbo.admin.controller;


import com.hbs.hsbbo.admin.dto.request.UserMenuRequest;
import com.hbs.hsbbo.admin.dto.response.UserMenuResponse;
import com.hbs.hsbbo.admin.dto.response.UserMenuTreeResponse;
import com.hbs.hsbbo.admin.service.UserMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user-menus")
public class UserMenuController {
    private final UserMenuService userMenuService;

    // 공통 - 사용자 메뉴 조회
    @GetMapping
    public List<UserMenuResponse> getAllMenus() {
        return userMenuService.getAllMenus();
    }

    // 공통 - 트리구조 메뉴 조회
    @GetMapping("/tree")
    public List<UserMenuTreeResponse> getMenuTree() {
        return userMenuService.getMenuTree();
    }

    // 관리자 - 사용자 메뉴 등록
    @PostMapping
    public UserMenuResponse createMenu(@RequestBody UserMenuRequest request,
                                       @RequestParam String adminId) {
        return userMenuService.createMenu(request, adminId);
    }
    
    // 관리자 - 사용자 메뉴 수정
    @PutMapping("/{id}")
    public UserMenuResponse updateMenu(@PathVariable Long id,
                                       @RequestBody UserMenuRequest request,
                                       @RequestParam String adminId) {
        return userMenuService.updateMenu(id, request, adminId);
    }
    
    // 관리자 사용자 메뉴 순서 변경
    @PatchMapping("/{id}/order")
    public ResponseEntity<?> updateOrder(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> payload) {
        Integer newOrder = payload.get("orderSequence");
        
        userMenuService.updateOrder(id, newOrder);
        return ResponseEntity.ok().build();
    }

    // 관리자 - 사용자 메뉴 삭제
    @DeleteMapping("/{id}")
    public void deleteMenu(@PathVariable Long id,
                           @RequestParam String adminId) {
        userMenuService.deleteMenu(id, adminId);
    }

    // 배포 확인용 임시 핑 (나중에 삭제 OK)
    @GetMapping("/_deploy-check")
    public Map<String, Object> deployCheck() {
        return Map.of(
                "service", "user-menus",
                "status", "ok",
                "time", java.time.Instant.now().toString()
        );
    }

}
