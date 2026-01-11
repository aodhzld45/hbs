package com.hbs.hsbbo.admin.maintenance.controller;

import com.hbs.hsbbo.admin.maintenance.dto.response.MaintenanceConfigResponse;
import com.hbs.hsbbo.admin.maintenance.service.MaintenanceConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/public/maintenance-config")
public class MaintenanceConfigPublicController {

    private final MaintenanceConfigService maintenanceConfigService;

    @GetMapping
    public ResponseEntity<MaintenanceConfigResponse> get() {
        return ResponseEntity.ok()
                .header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
                .body(MaintenanceConfigResponse.from(maintenanceConfigService.load()));
    }
}
