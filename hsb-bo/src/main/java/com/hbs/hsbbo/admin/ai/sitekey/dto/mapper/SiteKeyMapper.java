package com.hbs.hsbbo.admin.ai.sitekey.dto.mapper;

import com.hbs.hsbbo.admin.ai.sitekey.domain.entity.SiteKey;
import com.hbs.hsbbo.admin.ai.sitekey.domain.type.Status;
import com.hbs.hsbbo.admin.ai.sitekey.dto.request.SiteKeyCreateRequest;
import com.hbs.hsbbo.admin.ai.sitekey.dto.request.SiteKeyUpdateRequest;
import com.hbs.hsbbo.admin.ai.sitekey.dto.response.SiteKeyResponse;
import com.hbs.hsbbo.admin.ai.sitekey.dto.response.SiteKeySummaryResponse;

public final class SiteKeyMapper {
    private SiteKeyMapper() {}

    // Create → Entity
    public static SiteKey toEntity(SiteKeyCreateRequest req, String regAdm) {
        SiteKey e = SiteKey.builder()
                .siteKey(req.getSiteKey().trim())
                .planCode(trimOrNull(req.getPlanCode()))
                .dailyCallLimit(req.getDailyCallLimit())
                .dailyTokenLimit(req.getDailyTokenLimit())
                .monthlyTokenLimit(req.getMonthlyTokenLimit())
                .rateLimitRps(req.getRateLimitRps())
                .allowedDomains(req.getAllowedDomains())
                .defaultWidgetConfigId(req.getDefaultWidgetConfigId())
                .defaultPromptProfileId(req.getDefaultPromptProfileId())
                .notes(trimOrNull(req.getNotes()))
                .build();

        // 상태 기본값 처리 (대소문자/공백 허용)
        e.setStatus(Status.parseOrDefault(req.getStatus(), Status.ACTIVE));
        // 감사 필드
        e.setRegAdm(regAdm);
        return e;
    }

    // Update → Entity (partial)
    public static void applyUpdate(SiteKey e, SiteKeyUpdateRequest req, String upAdm) {

        //  Status: valueOf → parseOrDefault 로 교체 (안전 파싱)
        if (req.getStatus() != null) {
            e.setStatus(Status.parseOrDefault(req.getStatus(), e.getStatus()));
        }

        if (req.getPlanCode() != null) e.setPlanCode(trimOrNull(req.getPlanCode()));
        if (req.getDailyCallLimit() != null) e.setDailyCallLimit(req.getDailyCallLimit());
        if (req.getDailyTokenLimit() != null) e.setDailyTokenLimit(req.getDailyTokenLimit());
        if (req.getMonthlyTokenLimit() != null) e.setMonthlyTokenLimit(req.getMonthlyTokenLimit());
        if (req.getRateLimitRps() != null) e.setRateLimitRps(req.getRateLimitRps());

        if (req.getAllowedDomains() != null) {
            e.setAllowedDomains(req.getAllowedDomains());
        }

        if (req.getDefaultWidgetConfigId() != null) e.setDefaultWidgetConfigId(req.getDefaultWidgetConfigId());
        if (req.getDefaultPromptProfileId() != null) e.setDefaultPromptProfileId(req.getDefaultPromptProfileId());
        if (req.getNotes() != null) e.setNotes(trimOrNull(req.getNotes()));

        e.setUpAdm(upAdm);
    }

    // Entity → 상세 Response
    public static SiteKeyResponse toResponse(SiteKey e) {
        return SiteKeyResponse.builder()
                .id(e.getId())
                .siteKey(nullSafe(e.getSiteKey()))
                .status(e.getStatus() != null ? e.getStatus().name() : null)
                .planCode(nullSafe(e.getPlanCode()))
                .dailyCallLimit(e.getDailyCallLimit())
                .dailyTokenLimit(e.getDailyTokenLimit())
                .monthlyTokenLimit(e.getMonthlyTokenLimit())
                .rateLimitRps(e.getRateLimitRps())
                .allowedDomains(e.getAllowedDomains()) // 이미 List<String>
                .defaultWidgetConfigId(e.getDefaultWidgetConfigId())
                .defaultPromptProfileId(e.getDefaultPromptProfileId())
                .notes(nullSafe(e.getNotes()))
                // 감사 필드
                .useTf(e.getUseTf())
                .delTf(e.getDelTf())
                .regAdm(e.getRegAdm())
                .regDate(e.getRegDate())
                .upAdm(e.getUpAdm())
                .upDate(e.getUpDate())
                .delAdm(e.getDelAdm())
                .delDate(e.getDelDate())
                .build();
    }

    // Entity → 요약 Response
    public static SiteKeySummaryResponse toSummary(SiteKey e) {
        int domainCount = (e.getAllowedDomains() == null) ? 0 : e.getAllowedDomains().size();
        return SiteKeySummaryResponse.builder()
                .id(e.getId())
                .siteKey(nullSafe(e.getSiteKey()))
                .status(e.getStatus() != null ? e.getStatus().name() : null)
                .planCode(nullSafe(e.getPlanCode()))
                .dailyCallLimit(e.getDailyCallLimit())
                .dailyTokenLimit(e.getDailyTokenLimit())
                .domainCount(domainCount)
                .regDate(e.getRegDate())
                .upDate(e.getUpDate())
                .build();
    }

    // ====== helpers ======
    private static String trimOrNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private static String nullSafe(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }

}
