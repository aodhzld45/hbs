package com.hbs.hsbbo.admin.ai.promptprofile.dto.response;

import com.hbs.hsbbo.admin.ai.promptprofile.domain.entity.PromptProfile;
import com.hbs.hsbbo.admin.ai.promptprofile.domain.type.PromptStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class PromptProfileResponse {
    // 기본
    private Long id;
    private String tenantId;
    private String name;
    private String purpose;

    // 모델/파라미터
    private String model;
    private BigDecimal temperature;
    private BigDecimal topP;
    private Integer maxTokens;
    private Integer seed;
    private BigDecimal freqPenalty;
    private BigDecimal presencePenalty;
    private String stopJson;

    // 프롬프트 리소스
    private String systemTpl;
    private String guardrailTpl;
    private String styleJson;
    private String toolsJson;
    private String policiesJson;

    // 상태/감사 필드(읽기 전용)
    private Integer version;
    private PromptStatus status;    // DRAFT/ACTIVE/ARCHIVED
    private String useTf;
    private String delTf;
    private String regAdm;
    private LocalDateTime regDate;
    private String upAdm;
    private LocalDateTime upDate;

    // 엔티티 → 응답 매핑
    public static PromptProfileResponse from(PromptProfile e) {
        return PromptProfileResponse.builder()
                .id(e.getId())
                .tenantId(e.getTenantId())
                .name(e.getName())
                .purpose(e.getPurpose())

                .model(e.getModel())
                .temperature(e.getTemperature())
                .topP(e.getTopP())
                .maxTokens(e.getMaxTokens())
                .seed(e.getSeed())
                .freqPenalty(e.getFreqPenalty())
                .presencePenalty(e.getPresencePenalty())
                .stopJson(e.getStopJson())

                .systemTpl(e.getSystemTpl())
                .guardrailTpl(e.getGuardrailTpl())
                .styleJson(e.getStyleJson())
                .toolsJson(e.getToolsJson())
                .policiesJson(e.getPoliciesJson())

                .version(e.getVersion())
                .status(e.getStatus())
                .useTf(e.getUseTf())
                .delTf(e.getDelTf())
                .regAdm(e.getRegAdm())
                .regDate(e.getRegDate())
                .upAdm(e.getUpAdm())
                .upDate(e.getUpDate())
                .build();
    }
}
