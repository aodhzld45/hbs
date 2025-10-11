package com.hbs.hsbbo.admin.ai.sitekey.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteKeyCreateRequest {
    /** 공개 식별자 (예: HSBS-DEMO, sk_pub_xxx) */
    @NotBlank
    @Size(max = 40)
    private String siteKey;

    /** 상태 (기본 ACTIVE), 미지정 시 Default - ACTIVE로 처리 */
    @Pattern(regexp = "ACTIVE|SUSPENDED|REVOKED")
    private String status;

    /** 플랜 코드 (FREE/PRO/ENT 등) */
    @Size(max = 50)
    private String planCode;

    /** 한도 (null이면 무제한) */
    @PositiveOrZero
    private Integer dailyCallLimit;

    @PositiveOrZero
    private Long dailyTokenLimit;

    @PositiveOrZero
    private Long monthlyTokenLimit;

    /** 초당 요청 제한 */
    @PositiveOrZero
    private Integer rateLimitRps;

    /** 도메인 화이트리스트 */
    @NotNull
    @Size(max = 200)
    private List<@NotBlank @Size(max = 255) String> allowedDomains;

    /** 기본 연결 (선택) */
    private Long defaultWidgetConfigId;
    private Long defaultPromptProfileId;

    /** 메모 */
    @Size(max = 255)
    private String notes;

}
