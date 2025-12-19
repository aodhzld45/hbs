package com.hbs.hsbbo.admin.ai.usage.controller;

import com.hbs.hsbbo.admin.ai.usage.domain.type.Period;
import com.hbs.hsbbo.admin.ai.usage.dto.request.UsageStatsRequest;
import com.hbs.hsbbo.admin.ai.usage.dto.response.UsageStatsListResponse;
import com.hbs.hsbbo.admin.ai.usage.service.UsageStatsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@Slf4j
@RestController
@RequestMapping("/api/ai/usage-stats")
@RequiredArgsConstructor
public class UsageStatsController {

    private final UsageStatsService usageStatsService;

    /**
     * AI 사용 통계 조회 (일/주/월 단위)
     *
     * 예)
     * GET /api/ai/usage-stats?period=DAILY&fromDate=2025-12-01&toDate=2025-12-13&page=0&size=20
     */
    @GetMapping
    public UsageStatsListResponse getUsageStats(
            @RequestParam(name = "tenantId", required = false) String tenantId,
            @RequestParam(name = "period", required = false) String periodStr,
            @RequestParam(name = "fromDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(name = "toDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(name = "siteKeyId", required = false) Long siteKeyId,
            @RequestParam(name = "channel", required = false) String channel,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size
    ) {

        // 1) tenantId 기본값 (HSBS 고정 테넌트라면)
        String effectiveTenantId = (tenantId == null || tenantId.isBlank())
                ? "tenant-hsbs"   // TODO: 필요 시 상수/설정으로 분리
                : tenantId;

        // 2) period 파싱 (대소문자 허용, 기본 DAILY)
        Period period = Period.DAILY;
        if (periodStr != null && !periodStr.isBlank()) {
            try {
                period = Period.valueOf(periodStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Unknown UsageStatsPeriod '{}', fallback=DAILY", periodStr);
                period = Period.DAILY;
            }
        }

        // 3) 검색 요청 DTO 조립
        UsageStatsRequest req = UsageStatsRequest.builder()
                .tenantId(effectiveTenantId)
                .period(period)
                .fromDate(fromDate)
                .toDate(toDate)
                .siteKeyId(siteKeyId)
                .channel(channel)
                .page(page)
                .size(size)
                .build();

        // 4) 서비스 호출
        return usageStatsService.getUsageStats(req);
    }

    @GetMapping(value = "/export.xlsx",
            produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam(name = "tenantId", required = false) String tenantId,
            @RequestParam(name = "period", required = false) String periodStr,
            @RequestParam(name = "fromDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(name = "toDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(name = "siteKeyId", required = false) Long siteKeyId,
            @RequestParam(name = "channel", required = false) String channel,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size
    ) {
        String effectiveTenantId = (tenantId == null || tenantId.isBlank()) ? "tenant-hsbs" : tenantId;

        Period period = Period.DAILY;
        if (periodStr != null && !periodStr.isBlank()) {
            try { period = Period.valueOf(periodStr.toUpperCase()); }
            catch (IllegalArgumentException e) { log.warn("Unknown period '{}', fallback=DAILY", periodStr); }
        }

        UsageStatsRequest req = UsageStatsRequest.builder()
                .tenantId(effectiveTenantId)
                .period(period)
                .fromDate(fromDate)
                .toDate(toDate)
                .siteKeyId(siteKeyId)
                .channel(channel)
                .page(page)
                .size(size)
                .build();

        byte[] bytes = usageStatsService.exportUsageStatsExcel(req);

        String fileName = "usage_stats_" + period.name().toLowerCase()
                + "_p" + page + "_s" + size + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(bytes);
    }




}
