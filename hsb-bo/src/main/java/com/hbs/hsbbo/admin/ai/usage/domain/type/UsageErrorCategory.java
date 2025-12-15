package com.hbs.hsbbo.admin.ai.usage.domain.type;

public enum UsageErrorCategory {
    CLIENT,   // 잘못된 요청/파라미터, 포맷 에러 등
    AUTH,     // 인증/인가, siteKey/tenant 관련
    QUOTA,    // 쿼터/레이트리밋(429)
    UPSTREAM, // Brain(FastAPI) / OpenAI 등 외부 시스템 에러
    SERVER,   // HSBS 자바 서버 내부 에러
    UNKNOWN   // 분류하기 애매한 기타
}
