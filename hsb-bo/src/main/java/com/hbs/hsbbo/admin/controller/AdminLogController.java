package com.hbs.hsbbo.admin.controller;

import com.hbs.hsbbo.admin.dto.response.AdminLogListResponse;
import com.hbs.hsbbo.admin.dto.response.AdminLogResponse;
import com.hbs.hsbbo.admin.service.AdminLogService;
import com.hbs.hsbbo.common.util.ExcelUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.function.Function;

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

    @GetMapping("/excel")
    public ResponseEntity<Resource> getAdminLogExcel(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestParam(defaultValue = "10") int size
    ) {
        // [1] 관리자 로그 조회
        AdminLogListResponse response = adminLogService.getAdminLogList(
                keyword, start, end, 0, size
        );

        List<AdminLogResponse> adminLogs = response.getItems();

        // [2] 헤더 정의
        List<String> headers = List.of(
                "ID",
                "관리자ID",
                "액션",
                "상세",
                "URL",
                "IP",
                "로그일시"
        );

        // [3] 데이터 추출 함수 정의
        List<Function<AdminLogResponse, String>> extractors = List.of(
                log -> log.getId() != null ? String.valueOf(log.getId()) : "",
                log -> log.getAdminId() != null ? log.getAdminId() : "",
                log -> log.getAction() != null ? log.getAction() : "",
                log -> log.getDetail() != null ? log.getDetail() : "",
                log -> log.getUrl() != null ? log.getUrl() : "",
                log -> log.getIp() != null ? log.getIp() : "",
                log -> log.getLogDate() != null ? log.getLogDate().toString() : ""
        );

        // [4] ExcelUtil 호출
        ByteArrayInputStream excelStream = ExcelUtil.generateExcel(
                "관리자로그", adminLogs, headers, extractors
        );

        // [5] 파일명 세팅
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String filename = URLEncoder.encode("관리자로그_" + today + ".xlsx", StandardCharsets.UTF_8)
                .replaceAll("\\+", "%20");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"; filename*=UTF-8''" + filename)
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(excelStream));
    }



}
