package com.hbs.hsbbo.admin.ai.promptprofile.dto.request;


import com.hbs.hsbbo.admin.ai.promptprofile.domain.type.PromptStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromptProfileRequest {

    // 기본 식별/태깅
    @Size(max = 64)
    private String tenantId;

    @NotBlank @Size(max = 100)
    private String name;

    // 프롬프트 프로필 생성과 동시에 연결할 SiteKey ID
    private Long linkedSiteKeyId;

    @Size(max = 40)
    private String purpose; // support/sales/faq/portfolio

    // 모델/파라미터
    @NotBlank @Size(max = 60)
    private String model; // ex) gpt-4o-mini

    @NotNull
    @DecimalMin("0.0") @DecimalMax("1.0")
    private BigDecimal temperature;

    @DecimalMin("0.0") @DecimalMax("1.0")
    private BigDecimal topP;

    @Min(1)
    private Integer maxTokens;

    private Integer seed;

    @DecimalMin("-2.0") @DecimalMax("2.0")
    private BigDecimal freqPenalty;

    @DecimalMin("-2.0") @DecimalMax("2.0")
    private BigDecimal presencePenalty;

    // 멈춤 시퀀스 (Json String)
    private String stopJson;

    // 프롬프트 리소스들
    private String systemTpl;
    private String guardrailTpl;
    private String welcomeBlocksJson;
    private String styleJson;
    private String toolsJson;
    private String policiesJson;

    // 상태/버전
    private Integer version;              // null이면 엔티티 @PrePersist 기본값
    private PromptStatus status;    // DRAFT/ACTIVE/ARCHIVED
    private String useTf;                 // "Y"/"N" (null 허용: 기본값 처리)
    private String delTf;                 // "N" 고정 권장

}