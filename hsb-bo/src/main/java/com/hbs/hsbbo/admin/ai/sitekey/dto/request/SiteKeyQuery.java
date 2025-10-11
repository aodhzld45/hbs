package com.hbs.hsbbo.admin.ai.sitekey.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@Builder
public class SiteKeyQuery {
    // 조회 쿼리 DTO (리스트/검색용)

    /** 키/플랜/상태 검색 파라미터 (모두 선택적) */
    private String keyword;      // siteKey, notes 부분일치
    private String planCode;     // 정확 일치
    private String status;       // ACTIVE|SUSPENDED|REVOKED

    /** 페이징/정렬 */
    @Builder.Default
    private Integer page = 0;
    @Builder.Default
    private Integer size = 20;
    @Builder.Default
    private String sort = "regDate,desc"; // 다중 정렬 "planCode,asc;regDate,desc" 등으로 파싱 가능

}
