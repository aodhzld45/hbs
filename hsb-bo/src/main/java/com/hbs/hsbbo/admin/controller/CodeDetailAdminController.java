package com.hbs.hsbbo.admin.controller;

import com.hbs.hsbbo.admin.service.CodeDetailAdminService;
import com.hbs.hsbbo.common.dto.request.CodeDetailRequest;
import com.hbs.hsbbo.common.dto.response.CodeDetailResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/admin/code-details")
public class CodeDetailAdminController {

    private final CodeDetailAdminService codeDetailAdminService;

    @GetMapping("/all")
    public List<CodeDetailResponse> getAllDetails(@RequestParam Long groupId) {
        return codeDetailAdminService.getAllDetails(groupId);
    }

    @PostMapping
    public void createDetail(@RequestBody CodeDetailRequest req, String adminId) {
        codeDetailAdminService.createDetail(req, adminId);
    }

    @PatchMapping("/{id}/order")
    public ResponseEntity<?> updateOrder(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> payload) {

        Integer newOrder = payload.get("orderSequence");
        codeDetailAdminService.updateOrder(id, newOrder);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/use-tf")
    public ResponseEntity<Void> updateGDetailUseTf(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            @RequestParam String adminId
    ) {
        String useTf = payload.get("useTf");
        codeDetailAdminService.updateDetailUseTf(id, useTf, adminId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public void updateDetail(@PathVariable Long id, @RequestBody CodeDetailRequest req, String adminId) {
        codeDetailAdminService.updateDetail(id, req, adminId);
    }

    @DeleteMapping("/{id}")
    public void deleteDetail(@PathVariable Long id, String adminId) {
        codeDetailAdminService.deleteDetail(id, adminId);
    }

    // 엑셀 업로드
    @PostMapping("/upload")
    public ResponseEntity<Void> uploadExcel(
            @RequestParam MultipartFile file,
            @RequestParam Long groupId,
            @RequestParam String adminId
    ) {
        codeDetailAdminService.uploadExcel(file, groupId, adminId);
        return ResponseEntity.ok().build();
    }

}
