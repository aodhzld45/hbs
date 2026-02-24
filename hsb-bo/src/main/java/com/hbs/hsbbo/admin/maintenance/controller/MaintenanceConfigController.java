package com.hbs.hsbbo.admin.maintenance.controller;

import com.hbs.hsbbo.admin.aop.AdminActionLog;
import com.hbs.hsbbo.admin.maintenance.dto.request.MaintenanceConfigRequest;
import com.hbs.hsbbo.admin.maintenance.dto.response.MaintenanceConfigResponse;
import com.hbs.hsbbo.admin.maintenance.service.MaintenanceConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/admin/maintenance-config")
public class MaintenanceConfigController {

    private final MaintenanceConfigService maintenanceConfigService;


    // 점검 설정 조회
    @GetMapping
    public ResponseEntity<MaintenanceConfigResponse> get() {
        return ResponseEntity.ok(
                MaintenanceConfigResponse.from(maintenanceConfigService.load())
        );
    }


     // 점검 설정 저장(전체 덮어쓰기)
    @AdminActionLog(action = "점검 설정 저장", detail = "")
    @PutMapping
    public ResponseEntity<MaintenanceConfigResponse> save(
            @Valid @RequestBody MaintenanceConfigRequest req,
            @RequestParam(required = false) String actor) {
        return ResponseEntity.ok(
                MaintenanceConfigResponse.from(maintenanceConfigService.save(req))
        );
    }
}
