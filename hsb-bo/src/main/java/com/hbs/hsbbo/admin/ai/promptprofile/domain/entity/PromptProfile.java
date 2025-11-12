package com.hbs.hsbbo.admin.ai.promptprofile.domain.entity;

import com.hbs.hsbbo.admin.ai.promptprofile.domain.type.PromptStatus;
import com.hbs.hsbbo.common.AuditBase.AuditBase;
import jakarta.persistence.*;
import lombok.*;

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

    /** 스타일 기본값(JSON) — {"lang":"ko","tone":"formal","length":"short","emoji":"N"} */
    @Column(name = "style_json", columnDefinition = "json")
    private String styleJson;

    /** 허용 툴/함수 스키마(JSON) */
    @Column(name = "tools_json", columnDefinition = "json")
    private String toolsJson;

    /** 정책/금칙/PII 마스킹 규정(JSON) */
    @Column(name = "policies_json", columnDefinition = "json")
    private String policiesJson;

    // 배포/상태 & 감사
    @Column(name = "version", nullable = false)
    private Integer version;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "ENUM('DRAFT','ACTIVE','ARCHIVED')")
    private PromptStatus status;

    // 기본값 세팅
    @PrePersist
    protected void onCreate() {
        if (model == null)          model = "gpt-4o-mini";
        if (temperature == null)    temperature = new BigDecimal("0.70");
        if (version == null)        version = 1;
        if (status == null)         status = PromptStatus.DRAFT;
    }

}

