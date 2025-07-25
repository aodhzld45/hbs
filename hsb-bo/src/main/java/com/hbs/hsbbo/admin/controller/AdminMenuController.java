package com.hbs.hsbbo.admin.controller;

import com.hbs.hsbbo.admin.aop.AdminActionLog;
import com.hbs.hsbbo.admin.domain.entity.AdminMenu;
import com.hbs.hsbbo.admin.dto.response.AdminMenuResponse;
import com.hbs.hsbbo.admin.repository.AdminMenuRepository;
import com.hbs.hsbbo.admin.service.AdminMenuService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Tag(name = "관리자 메뉴 관리 API", description = "관리자 메뉴 등록, 수정, 삭제, 순서 변경 등의 API")
@RestController
@RequestMapping("/api/admin/menus")
public class AdminMenuController {

    @Autowired
    private AdminMenuService adminMenuService;

    @Autowired
    private AdminMenuRepository adminMenuRepository;

    // 전체 메뉴 조회 (삭제되지 않은 메뉴만, del_tf = 'N')
    @Operation(summary = "관리자 메뉴 전체 조회 - 트리형태", description = "삭제되지 않은(del_tf = 'N') 전체 메뉴 조회")
    @GetMapping
    @AdminActionLog(
            action = "조회",
            detail = "관리자 메뉴 목록 조회"
    )
    public ResponseEntity<List<AdminMenu>> getAllMenus() {
        List<AdminMenu> menus = adminMenuRepository.findByDelTfOrderByOrderSequenceAsc("N");
        return ResponseEntity.ok(menus);
    }

    // 메뉴 순서 변경
    @Operation(summary = "메뉴 순서 변경", description = "관리자 메뉴의 정렬 순서를 변경")
    @PatchMapping("/{id}/order")
    @AdminActionLog(
            action = "수정",
            detail = "메뉴 ID={id}의 순서를 {orderSequence}번으로 수정"
    )
    public ResponseEntity<?> updateOrder(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> payload) {
        Integer newOrder = payload.get("orderSequence");
        adminMenuService.updateOrder(id, newOrder);
        return ResponseEntity.ok().build();
    }

    // 메뉴 등록
    @Operation(summary = "메뉴 등록", description = "새로운 관리자 메뉴를 등록 뎁스 설정 가능")
    @PostMapping
    @AdminActionLog(
            action = "등록",
            detail = "메뉴 ID={id}, 이름={name} 등록"
    )
    public ResponseEntity<AdminMenu> createMenu(@Valid @RequestBody AdminMenu menu) {
        // 필요시 추가 검증 로직
        AdminMenu savedMenu = adminMenuRepository.save(menu);
        return ResponseEntity.status(201).body(savedMenu);
    }

    // 메뉴 수정
    @Operation(summary = "메뉴 수정", description = "기존 메뉴의 정보를 수정")
    @PutMapping("/{id}")
    @AdminActionLog(
            action = "수정",
            detail = "메뉴 ID={id} 수정"
    )
    public ResponseEntity<?> updateMenu(@PathVariable("id") Integer id, @Valid @RequestBody AdminMenu updatedMenu) {
        Optional<AdminMenu> optionalMenu = adminMenuRepository.findById(Long.valueOf(id));
        if (optionalMenu.isPresent()) {
            AdminMenu menu = optionalMenu.get();
            menu.setName(updatedMenu.getName());
            menu.setDepth(updatedMenu.getDepth());
            menu.setParentId(updatedMenu.getParentId());
            menu.setDescription(updatedMenu.getDescription());
            menu.setUrl(updatedMenu.getUrl());
            menu.setOrderSequence(updatedMenu.getOrderSequence());
            menu.setUseTf(updatedMenu.getUseTf());
            // del_tf는 삭제할 때만 변경 (여기서는 수정 시 변경하지 않음)
            adminMenuRepository.save(menu);
            return ResponseEntity.ok(menu);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 메뉴 삭제 (논리 삭제: del_tf를 'Y'로 변경)
    @Operation(summary = "메뉴 삭제", description = "메뉴를 논리 삭제(del_tf = 'Y') 처리")
    @DeleteMapping("/{id}")
    @AdminActionLog(
            action = "삭제",
            detail = "메뉴 ID={id}, 이름={name} 삭제됨"
    )
    public ResponseEntity<AdminMenuResponse> deleteMenu(@PathVariable("id") Integer id) {
        Optional<AdminMenu> optionalMenu = adminMenuRepository.findById(Long.valueOf(id));
        if (optionalMenu.isPresent()) {
            AdminMenu menu = optionalMenu.get();
            menu.setDelTf("Y");
            adminMenuRepository.save(menu);

            // 엔티티 → DTO 변환
            AdminMenuResponse response = AdminMenuResponse.fromEntity(menu);
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
