package com.hbs.hsbbo.admin.ai.promptprofile.domain.entity;

import com.hbs.hsbbo.admin.ai.promptprofile.domain.type.PromptStatus;
import com.hbs.hsbbo.common.AuditBase.AuditBase;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;

@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ai_prompt_profile")
public class PromptProfile extends AuditBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 멀티테넌시 식별자 (없으면 글로벌 설정) */
    @Column(name = "tenant_id", length = 64)
    private String tenantId;

    /** 프로필 이름 (관리/검색 용) */
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    /** 용도 태그: support/sales/faq/portfolio 등 */
    @Column(name = "purpose", length = 40)
    private String purpose;

    // 모델/파라미터
    @Column(name = "model", nullable = false, length = 60)
    private String model;

    @Column(name = "temperature", precision = 3, scale = 2, nullable = false)
    private BigDecimal temperature;

    @Column(name = "top_p", precision = 3, scale = 2)
    private BigDecimal topP;

    /** 출력 최대 토큰 */
    @Column(name = "max_tokens")
    private Integer maxTokens;

    /** 결정론적 재현(옵션) */
    @Column(name = "seed")
    private Integer seed;

    @Column(name = "freq_penalty", precision = 3, scale = 2)
    private BigDecimal freqPenalty;

    @Column(name = "presence_penalty", precision = 3, scale = 2)
    private BigDecimal presencePenalty;

    /** 중단 시퀀스 배열(JSON 문자 저장) */
    @Column(name = "stop_json", columnDefinition = "json")
    private String stopJson;

    // 프롬프트 자원
    /** 시스템 프롬프트 템플릿 (${siteName}, ${lang}, ${tone}, ${length} …) */
    @Lob
    @Column(name = "system_tpl", columnDefinition = "MEDIUMTEXT")
    private String systemTpl;

    /** 가드레일 템플릿(금칙/규정/톤) */
    @Lob
    @Column(name = "guardrail_tpl", columnDefinition = "MEDIUMTEXT")
    private String guardrailTpl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "welcome_blocks_json", columnDefinition = "json")
    private String welcomeBlocksJson;


    /** 스타일 기본값(JSON) — {"lang":"ko","tone":"formal","length":"short","emoji":"N"} */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "style_json", columnDefinition = "json")
    private String styleJson;

    /** 허용 툴/함수 스키마(JSON) */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "tools_json", columnDefinition = "json")
    private String toolsJson;

    /** 정책/금칙/PII 마스킹 규정(JSON) */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "policies_json", columnDefinition = "json")
    private String policiesJson;

    // 배포/상태 & 감사
    @Column(name = "version", nullable = false)
    private Integer version;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "ENUM('DRAFT','ACTIVE','ARCHIVED')")
    private PromptStatus status;

    // 챗봇 타입 - kb-document기반 문서 know|
    @Column(name = "chat_type", nullable = false, length = 20)
    private String chatType;

    @Column(name = "category", length = 50)
    private String category; // legal | saju | career ...

    @Column(name = "persona", length = 255)
    private String persona;

    @Column(name = "memory_policy", length = 30)
    private String memoryPolicy; // short | summary_history

    @Column(name = "role_template_code", length = 100)
    private String roleTemplateCode;

    @Column(name = "execution_template_code", length = 100)
    private String executionTemplateCode;

    @Column(name = "flow_template_code", length = 100)
    private String flowTemplateCode;

    @Column(name = "few_shot_mode", nullable = false, length = 20)
    private String fewShotMode; // NONE | STATIC | PROFILE

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "few_shot_examples_json", columnDefinition = "json")
    private String fewShotExamplesJson;

    @Column(name = "response_format", nullable = false, length = 30)
    private String responseFormat; // TEXT | JSON_OBJECT | JSON_SCHEMA | MARKDOWN

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "output_schema_json", columnDefinition = "json")
    private String outputSchemaJson;

    @Column(name = "schema_enforce_tf", nullable = false, length = 1)
    private String schemaEnforceTf; // Y | N

    @Column(name = "schema_retry_count", nullable = false)
    private Integer schemaRetryCount;

    @Column(name = "streaming_tf", nullable = false, length = 1)
    private String streamingTf; // Y | N

    @Column(name = "fallback_model", length = 60)
    private String fallbackModel;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "fallback_policy_json", columnDefinition = "json")
    private String fallbackPolicyJson;

    @Column(name = "tool_choice_policy", length = 20)
    private String toolChoicePolicy; // AUTO | REQUIRED | NONE

    @Column(name = "reasoning_policy", length = 30)
    private String reasoningPolicy; // DIRECT | DELIBERATE

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "template_vars_json", columnDefinition = "json")
    private String templateVarsJson;

    @Column(name = "strict_grounding_tf", nullable = false, length = 1)
    private String strictGroundingTf; // Y | N

    @Column(name = "require_citation_tf", nullable = false, length = 1)
    private String requireCitationTf; // Y | N

    /** 이 프로필에서 지문으로 사용할 KB 문서 ID 목록 (JSON 배열, 예: [1,2,3]). BO가 조회해 knowledgeContext 문자열로 조합 후 Brain에 전달. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "kb_document_ids", columnDefinition = "json")
    private String kbDocumentIdsJson;

    // 기본값 세팅
    @PrePersist
    protected void onCreate() {
        if (model == null) model = "gpt-4o-mini";
        if (temperature == null) temperature = new BigDecimal("0.70");
        if (version == null) version = 1;
        if (status == null) status = PromptStatus.DRAFT;

        if (fewShotMode == null) fewShotMode = "NONE";
        if (responseFormat == null) responseFormat = "TEXT";
        if (schemaEnforceTf == null) schemaEnforceTf = "N";
        if (schemaRetryCount == null) schemaRetryCount = 0;
        if (streamingTf == null) streamingTf = "N";
    }


}

