package com.hbs.hsbbo.admin.ai.promptprofile.dto.response;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hbs.hsbbo.admin.ai.promptprofile.domain.entity.PromptProfile;
import com.hbs.hsbbo.admin.ai.promptprofile.domain.type.PromptStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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
    private String welcomeBlocksJson;
    private String styleJson;
    private String toolsJson;
    private String policiesJson;

    // 상태/감사 필드(읽기 전용)
    private Integer version;
    private PromptStatus status;    // DRAFT/ACTIVE/ARCHIVED

    /**
     * ===== 확장 필드 =====
     */
    private String chatType;
    private String category;
    private String persona;
    private String memoryPolicy;
    private String strictGroundingTf;
    private String requireCitationTf;
    /**
    *
    **/
    private String useTf;
    private String delTf;
    private String regAdm;
    private LocalDateTime regDate;
    private String upAdm;
    private LocalDateTime upDate;

    /** 이 프로필에서 지문으로 사용할 KB 문서 ID 목록 */
    private List<Long> kbDocumentIds;

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
                .welcomeBlocksJson(e.getWelcomeBlocksJson())
                .styleJson(e.getStyleJson())
                .toolsJson(e.getToolsJson())
                .policiesJson(e.getPoliciesJson())

                .version(e.getVersion())
                .status(e.getStatus())

                .chatType(e.getChatType())
                .category(e.getCategory())
                .persona(e.getPersona())
                .memoryPolicy(e.getMemoryPolicy())
                .strictGroundingTf(e.getStrictGroundingTf())
                .requireCitationTf(e.getRequireCitationTf())

                .useTf(e.getUseTf())
                .delTf(e.getDelTf())
                .regAdm(e.getRegAdm())
                .regDate(e.getRegDate())
                .upAdm(e.getUpAdm())
                .upDate(e.getUpDate())
                .kbDocumentIds(parseKbDocumentIds(e.getKbDocumentIdsJson()))
                .build();
    }

    private static final ObjectMapper OM = new ObjectMapper();

    private static List<Long> parseKbDocumentIds(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return OM.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            return List.of();
        }
    }
}
