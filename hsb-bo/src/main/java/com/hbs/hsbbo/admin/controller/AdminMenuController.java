package com.hbs.hsbbo.admin.controller;

import com.hbs.hsbbo.admin.aop.AdminActionLog;
import com.hbs.hsbbo.admin.domain.entity.AdminMenu;
import com.hbs.hsbbo.admin.dto.response.AdminMenuResponse;
import com.hbs.hsbbo.admin.repository.AdminMenuRepository;
import com.hbs.hsbbo.admin.service.AdminMenuService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Tag(name = "관리자 메뉴 관리 API", description = "관리자 메뉴 조회, 등록, 수정, 삭제, 순서 변경 API")
@RestController
@RequestMapping("/api/admin/menus")
@RequiredArgsConstructor
public class AdminMenuController {

    private final AdminMenuService adminMenuService;
    private final AdminMenuRepository adminMenuRepository;

    @Operation(summary = "관리자 메뉴 전체 조회", description = "삭제되지 않은(del_tf = 'N') 관리자 메뉴를 조회합니다.")
    @GetMapping
    @AdminActionLog(
            action = "조회",
            detail = "관리자 메뉴 목록 조회"
    )
    public ResponseEntity<List<AdminMenuResponse>> getAllMenus() {
        List<AdminMenuResponse> menus = adminMenuRepository.findByDelTfOrderByOrderSequenceAsc("N")
                .stream()
                .map(AdminMenuResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(menus);
    }

    @Operation(summary = "메뉴 순서 변경", description = "관리자 메뉴의 정렬 순서를 변경합니다.")
    @PatchMapping("/{id}/order")
    @AdminActionLog(
            action = "수정",
            detail = "메뉴 ID={id}의 순서를 {orderSequence}로 수정"
    )
    public ResponseEntity<Void> updateOrder(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> payload) {
        Integer newOrder = payload.get("orderSequence");
        adminMenuService.updateOrder(id, newOrder);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "메뉴 등록", description = "새로운 관리자 메뉴를 등록합니다.")
    @PostMapping
    @AdminActionLog(
            action = "등록",
            detail = "메뉴 ID={id}, 이름={name} 등록"
    )
    public ResponseEntity<AdminMenuResponse> createMenu(@Valid @RequestBody AdminMenu menu) {
        AdminMenu savedMenu = adminMenuRepository.save(menu);
        return ResponseEntity.status(201).body(AdminMenuResponse.fromEntity(savedMenu));
    }

    @Operation(summary = "메뉴 수정", description = "기존 관리자 메뉴 정보를 수정합니다.")
    @PutMapping("/{id}")
    @AdminActionLog(
            action = "수정",
            detail = "메뉴 ID={id} 수정"
    )
    public ResponseEntity<AdminMenuResponse> updateMenu(
            @PathVariable("id") Integer id,
            @Valid @RequestBody AdminMenu updatedMenu
    ) {
        Optional<AdminMenu> optionalMenu = adminMenuRepository.findById(Long.valueOf(id));
        if (optionalMenu.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        AdminMenu menu = optionalMenu.get();
        menu.setName(updatedMenu.getName());
        menu.setDepth(updatedMenu.getDepth());
        menu.setParentId(updatedMenu.getParentId());
        menu.setDescription(updatedMenu.getDescription());
        menu.setUrl(updatedMenu.getUrl());
        menu.setComponentKey(updatedMenu.getComponentKey());
        menu.setOrderSequence(updatedMenu.getOrderSequence());
        menu.setUseTf(updatedMenu.getUseTf());

        AdminMenu savedMenu = adminMenuRepository.save(menu);
        return ResponseEntity.ok(AdminMenuResponse.fromEntity(savedMenu));
    }

    @Operation(summary = "메뉴 삭제", description = "관리자 메뉴를 soft delete(del_tf = 'Y') 처리합니다.")
    @DeleteMapping("/{id}")
    @AdminActionLog(
            action = "삭제",
            detail = "메뉴 ID={id}, 이름={name} 삭제"
    )
    public ResponseEntity<AdminMenuResponse> deleteMenu(@PathVariable("id") Integer id) {
        Optional<AdminMenu> optionalMenu = adminMenuRepository.findById(Long.valueOf(id));
        if (optionalMenu.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        AdminMenu menu = optionalMenu.get();
        menu.setDelTf("Y");
        AdminMenu savedMenu = adminMenuRepository.save(menu);
        return ResponseEntity.ok(AdminMenuResponse.fromEntity(savedMenu));
    }
}
