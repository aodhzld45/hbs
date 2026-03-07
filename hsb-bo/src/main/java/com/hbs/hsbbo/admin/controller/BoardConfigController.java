package com.hbs.hsbbo.admin.controller;

import com.hbs.hsbbo.admin.aop.AdminActionLog;
import com.hbs.hsbbo.admin.dto.request.BoardConfigRequest;
import com.hbs.hsbbo.admin.dto.response.BoardConfigListResponse;
import com.hbs.hsbbo.admin.dto.response.BoardConfigResponse;
import com.hbs.hsbbo.admin.service.BoardConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/board-config")
public class BoardConfigController {

    private final BoardConfigService boardConfigService;

    @GetMapping("/list")
    public ResponseEntity<BoardConfigListResponse> getBoardConfigList(
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(required = false) String useTf,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(boardConfigService.getBoardConfigList(keyword, useTf, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BoardConfigResponse> getBoardConfig(@PathVariable Long id) {
        return ResponseEntity.ok(boardConfigService.getBoardConfig(id));
    }

    @AdminActionLog(action = "게시판 설정 등록", detail = "")
    @PostMapping
    public ResponseEntity<Long> createBoardConfig(
            @RequestBody BoardConfigRequest request,
            @RequestParam String adminId
    ) {
        return ResponseEntity.ok(boardConfigService.createBoardConfig(request, adminId));
    }

    @AdminActionLog(action = "게시판 설정 수정", detail = "id={id}")
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateBoardConfig(
            @PathVariable Long id,
            @RequestBody BoardConfigRequest request,
            @RequestParam String adminId
    ) {
        boardConfigService.updateBoardConfig(id, request, adminId);
        return ResponseEntity.ok().build();
    }

    @AdminActionLog(action = "게시판 설정 사용여부 변경", detail = "id={id}")
    @PutMapping("/{id}/use-tf")
    public ResponseEntity<Void> updateUseTf(
            @PathVariable Long id,
            @RequestParam String useTf,
            @RequestParam String adminId
    ) {
        boardConfigService.updateUseTf(id, useTf, adminId);
        return ResponseEntity.ok().build();
    }

    @AdminActionLog(action = "게시판 설정 삭제", detail = "id={id}")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoardConfig(
            @PathVariable Long id,
            @RequestParam String adminId
    ) {
        boardConfigService.deleteBoardConfig(id, adminId);
        return ResponseEntity.ok().build();
    }
}
