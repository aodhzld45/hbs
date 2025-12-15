package com.hbs.hsbbo.admin.ai.usage.domain.type;

import lombok.Getter;

@Getter
public enum UsageErrorCode {
    SITE_KEY_HEADER_MISSING(UsageErrorCategory.AUTH, 401),   // X-HSBS-Site-Key 없음
    SITE_KEY_NOT_FOUND(UsageErrorCategory.AUTH, 404),        // 등록되지 않은 SiteKey
    SITE_KEY_INACTIVE(UsageErrorCategory.AUTH, 403),         // del_tf = 'Y' / use_tf = 'N' 등
    SITE_KEY_DOMAIN_MISMATCH(UsageErrorCategory.AUTH, 403),  // 도메인 화이트리스트 불일치
    TENANT_MISMATCH(UsageErrorCategory.AUTH, 403),           // tenantId 불일치

    // 쿼터 / 레이트리밋 (QUOTA)
    QUOTA_SITE_KEY_EXCEEDED(UsageErrorCategory.QUOTA, 429),  // siteKey 일일 한도 초과
    QUOTA_IP_EXCEEDED(UsageErrorCategory.QUOTA, 429),        // IP 기준 무료 한도 초과

    // 업스트림(Brain / OpenAI) 문제 (UPSTREAM)
    BRAIN_TIMEOUT(UsageErrorCategory.UPSTREAM, 504),         // FastAPI Brain 타임아웃
    BRAIN_HTTP_5XX(UsageErrorCategory.UPSTREAM, 502),        // Brain에서 5xx 리턴
    OPENAI_ERROR(UsageErrorCategory.UPSTREAM, 502),          // OpenAI API 에러 (4xx/5xx 래핑)

    // 일반적인 클라이언트 / 서버 에러
    INVALID_REQUEST(UsageErrorCategory.CLIENT, 400),         // 잘못된 JSON, 필수 파라미터 누락 등
    INTERNAL_ERROR(UsageErrorCategory.SERVER, 500);          // 예상치 못한 서버 예외

    private final UsageErrorCategory category;
    private final int defaultHttpStatus;

    UsageErrorCode(UsageErrorCategory category, int defaultHttpStatus) {
        this.category = category;
        this.defaultHttpStatus = defaultHttpStatus;
    }
}
