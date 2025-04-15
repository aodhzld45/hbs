package com.hbs.hsbbo.admin.controller;

import com.hbs.hsbbo.admin.domain.entity.AdminMenu;
import com.hbs.hsbbo.admin.repository.AdminMenuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/menus")
public class AdminMenuController {

    @Autowired
    private AdminMenuRepository adminMenuRepository;

    // 전체 메뉴 조회 (삭제되지 않은 메뉴만, del_tf = 'N')
    @GetMapping
    public ResponseEntity<List<AdminMenu>> getAllMenus() {
        List<AdminMenu> menus = adminMenuRepository.findByDelTfOrderByOrderSequenceAsc("N");
        return ResponseEntity.ok(menus);
    }

    // 메뉴 등록
    @PostMapping
    public ResponseEntity<AdminMenu> createMenu(@Valid @RequestBody AdminMenu menu) {
        // 필요시 추가 검증 로직
        AdminMenu savedMenu = adminMenuRepository.save(menu);
        return ResponseEntity.status(201).body(savedMenu);
    }

    // 메뉴 수정
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMenu(@PathVariable("id") Integer id, @Valid @RequestBody AdminMenu updatedMenu) {
        Optional<AdminMenu> optionalMenu = adminMenuRepository.findById(id);
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
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMenu(@PathVariable("id") Integer id) {
        Optional<AdminMenu> optionalMenu = adminMenuRepository.findById(id);
        if (optionalMenu.isPresent()) {
            AdminMenu menu = optionalMenu.get();
            menu.setDelTf("Y");
            adminMenuRepository.save(menu);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
