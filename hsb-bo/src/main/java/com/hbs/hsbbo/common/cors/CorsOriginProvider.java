package com.hbs.hsbbo.common.cors;

import java.util.List;

public interface CorsOriginProvider {
    /** 테넌트별 허용 Origin 패턴 목록 (null: 공통/기본) */
    List<String> getAllowedOriginPatterns(String tenantId);

    /** 공통(테넌트 미지정) 허용 Origin 패턴 목록 */
    default List<String> getAllowedOriginPatterns() {
        return getAllowedOriginPatterns(null);
    }
}
