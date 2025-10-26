package com.hbs.hsbbo.admin.ai.sitekey.domain.entity;

import com.hbs.hsbbo.admin.ai.sitekey.domain.type.Status;
import com.hbs.hsbbo.admin.ai.widgetconfig.domain.entity.WidgetConfig;
import com.hbs.hsbbo.common.AuditBase.AuditBase;
import com.hbs.hsbbo.common.util.StringListJsonConverter;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.DynamicUpdate;

import java.util.List;

@Entity
@Table(
        name = "ai_site_key",
        indexes = {
                @Index(name = "idx_status", columnList = "status"),
                @Index(name = "idx_plan_code", columnList = "plan_code"),
                @Index(name = "idx_reg_date", columnList = "reg_date"),
                @Index(name = "idx_widget_default", columnList = "default_widget_config_id"),
                @Index(name = "idx_prompt_default", columnList = "default_prompt_profile_id")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_site_key", columnNames = "site_key")
        }
)
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@DynamicUpdate
public class SiteKey extends AuditBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 브라우저 임베드에서 쓰는 ‘공개 식별자’
     */
    @Column(name = "site_key", nullable = false, length = 40, unique = true)
    @NotBlank
    private String siteKey;

    /**
     * 상태값
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    @Builder.Default
    private Status status = Status.ACTIVE;

    /**
     * 간단 플랜 코드 (FREE/PRO/ENT 등)
     */
    @Column(name = "plan_code", length = 50)
    private String planCode;

    /**
     * 한도/레이트리밋 (NULL이면 제한 없음)
     */
    @Column(name = "daily_call_limit")
    private Integer dailyCallLimit;

    @Column(name = "daily_token_limit")
    private Long dailyTokenLimit;

    @Column(name = "monthly_token_limit")
    private Long monthlyTokenLimit;

    @Column(name = "rate_limit_rps")
    private Integer rateLimitRps;

    /**
     * 도메인 화이트리스트(JSON)
     */
    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "allowed_domains", columnDefinition = "json", nullable = false)
    @Builder.Default
    private List<String> allowedDomains = List.of();

    /**
     * 기본 연결 (지연 FK; 실제 FK는 후속 마이그레이션에서 추가완료)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "default_widget_config_id")
    private WidgetConfig defaultWidgetConfig;

    @Column(name = "default_prompt_profile_id")
    private Long defaultPromptProfileId;

    /**
     * 운영 메모
     */
    @Column(name = "notes", length = 255)
    private String notes;

    // ====== 편의 메서드 ======
    public boolean isActive() {
        return this.status == Status.ACTIVE && "Y".equalsIgnoreCase(getUseTf()) && !"Y".equalsIgnoreCase(getDelTf());
    }

    /**
     * 요청 도메인이 화이트리스트에 포함되는지 검사 (와일드카드 *.example.com 지원)
     */
    public boolean isDomainAllowed(String host) {
        if (allowedDomains == null || allowedDomains.isEmpty()) return false;
        if (host == null || host.isBlank()) return false;
        String h = host.trim().toLowerCase();
        for (String rule : allowedDomains) {
            if (rule == null || rule.isBlank()) continue;
            String r = rule.trim().toLowerCase();
            if (r.startsWith("*.")) {
                // 와일드카드: *.example.com -> sub.example.com 허용
                String suffix = r.substring(1); // ".example.com"
                if (h.endsWith(suffix) && h.length() > suffix.length()) return true;
            } else if (r.equals(h)) {
                return true;
            }
        }
        return false;
    }
}
