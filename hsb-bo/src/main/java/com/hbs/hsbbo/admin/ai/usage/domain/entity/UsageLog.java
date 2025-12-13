package com.hbs.hsbbo.admin.ai.usage.domain.entity;

import com.hbs.hsbbo.admin.ai.promptprofile.domain.entity.PromptProfile;
import com.hbs.hsbbo.admin.ai.sitekey.domain.entity.SiteKey;
import com.hbs.hsbbo.admin.ai.widgetconfig.domain.entity.WidgetConfig;
import com.hbs.hsbbo.common.AuditBase.AuditBase;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "ai_usage_log")
public class UsageLog extends AuditBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ============= 테넌트 / 식별 =============

    @Column(name = "tenant_id", length = 50, nullable = false)
    private String tenantId;              // 예: "hsbs"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_key_id")
    private SiteKey siteKey;             // FK: ai_site_key.id

    @Column(name = "site_key", length = 100)
    private String siteKeyValue;         // site_key 문자열 (조회/로그 편의용)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prompt_profile_id")
    private PromptProfile promptProfile; // FK: ai_prompt_profile.id

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "widget_config_id")
    private WidgetConfig widgetConfig;   // FK: ai_widget_config.id

    @Column(name = "conversation_id", length = 100)
    private String conversationId;       // 대화 쓰레드 ID

    @Column(name = "channel", length = 30, nullable = false)
    private String channel;              // widget / admin / api 등

    // ============= 요청/응답 요약 =============

    @Column(name = "request_text", length = 1000)
    private String requestText;          // 사용자 질문 요약/앞부분

    @Column(name = "answer_text", length = 1000)
    private String answerText;           // 응답 텍스트 앞부분(옵션)

    // ============= LLM 사용 정보 =============

    @Column(name = "model", length = 100)
    private String model;                // 실제 사용된 모델명

    @Column(name = "prompt_tokens")
    private Integer promptTokens;

    @Column(name = "completion_tokens")
    private Integer completionTokens;

    @Column(name = "total_tokens")
    private Integer totalTokens;

    @Column(name = "latency_ms")
    private Long latencyMs;           // 응답까지 걸린 시간(ms)

    // ============= 클라이언트 / 환경 정보 =============

    @Column(name = "user_ip", length = 45)
    private String userIp;

    @Column(name = "user_agent", length = 255)
    private String userAgent;

    @Column(name = "client_host", length = 255)
    private String clientHost;           // Origin/Referer 기반 호스트

    // ============= 결과/에러/쿼터 정보 =============

    @Column(name = "http_status", nullable = false)
    private Integer httpStatus;          // Brain → 자바에서 받은 HTTP 상태 코드

    @Column(name = "success_tf", length = 1, nullable = false)
    private String successTf;            // 'Y' / 'N'

    @Column(name = "error_code", length = 100)
    private String errorCode;            // 예: OPENAI_TIMEOUT, QUOTA_EXCEEDED 등

    @Column(name = "error_message", length = 500)
    private String errorMessage;

    @Column(name = "quota_type", length = 20)
    private String quotaType;            // IP / SITE_KEY 등

    @Column(name = "quota_remaining")
    private Integer quotaRemaining;      // 남은 횟수

    // ============= RAG / Tool 사용 여부 =============

    @Column(name = "rag_used_tf", length = 1, nullable = false)
    private String ragUsedTf;            // 'Y' / 'N'

    @Column(name = "rag_source_count")
    private Integer ragSourceCount;      // 참고한 RAG 소스 수

    @Column(name = "tool_used_tf", length = 1, nullable = false)
    private String toolUsedTf;           // 'Y' / 'N'
}
