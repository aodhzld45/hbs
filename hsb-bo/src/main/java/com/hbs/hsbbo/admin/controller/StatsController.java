package com.hbs.hsbbo.admin.controller;

import com.hbs.hsbbo.admin.dto.statsDTO.response.content.ContentStatsResponse;
import com.hbs.hsbbo.admin.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    @Autowired
    private final StatsService statsService;

    // GET /api/stats/content?startDate=2025-01-01T00:00:00&endDate=2025-06-30T23:59:59
    @GetMapping("/content")
    public ResponseEntity<ContentStatsResponse> getContentStats(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        return ResponseEntity.ok(statsService.getContentStats(startDate, endDate));
    }


}
