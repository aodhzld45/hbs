package com.hbs.hsbbo.admin.controller;

import com.hbs.hsbbo.admin.dto.response.AdminLogListResponse;
import com.hbs.hsbbo.admin.service.AdminLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RequiredArgsConstructor
@RequestMapping("/api/admin/admin-log")
@RestController
public class AdminLogController {

    private final AdminLogService adminLogService;

    @GetMapping
    public ResponseEntity<AdminLogListResponse> getAdminLogList(
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        AdminLogListResponse response = adminLogService.getAdminLogList(
                keyword, start, end, page, size
        );

        return ResponseEntity.ok(response);
    }

}
