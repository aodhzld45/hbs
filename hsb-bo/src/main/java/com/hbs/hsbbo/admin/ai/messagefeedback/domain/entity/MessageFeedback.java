package com.hbs.hsbbo.admin.ai.messagefeedback.domain.entity;

import com.hbs.hsbbo.admin.ai.messagefeedback.domain.type.MessageFeedbackType;
import com.hbs.hsbbo.admin.ai.sitekey.domain.entity.SiteKey;
import com.hbs.hsbbo.admin.ai.usage.domain.entity.UsageLog;
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
@Table(
        name = "ai_message_feedback",
        indexes = {
                @Index(name = "idx_amf_site_key", columnList = "site_key"),
                @Index(name = "idx_amf_site_key_id", columnList = "site_key_id"),
                @Index(name = "idx_amf_usage_log_id", columnList = "usage_log_id"),
                @Index(name = "idx_amf_message_id", columnList = "message_id"),
                @Index(name = "idx_amf_feedback_type", columnList = "feedback_type"),
                @Index(name = "idx_amf_reg_date", columnList = "reg_date")
        }
)
public class MessageFeedback extends AuditBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", length = 50, nullable = false)
    private String tenantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_key_id")
    private SiteKey siteKey;

    @Column(name = "site_key", length = 100, nullable = false)
    private String siteKeyValue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usage_log_id")
    private UsageLog usageLog;

    @Column(name = "conversation_id", length = 100)
    private String conversationId;

    @Column(name = "message_id", length = 100, nullable = false)
    private String messageId;

    @Column(name = "question_text", length = 1000)
    private String questionText;

    @Column(name = "answer_text", length = 1000)
    private String answerText;

    @Enumerated(EnumType.STRING)
    @Column(name = "feedback_type", length = 20, nullable = false)
    private MessageFeedbackType feedbackType;

    @Column(name = "feedback_reason", length = 500)
    private String feedbackReason;

    @Column(name = "client_host", length = 255)
    private String clientHost;

    @Column(name = "user_ip", length = 45)
    private String userIp;

    @Column(name = "user_agent", length = 255)
    private String userAgent;
}
