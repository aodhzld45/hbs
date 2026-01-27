package com.hbs.hsbbo.admin.ai.kb.domain.entity;

import com.hbs.hsbbo.admin.ai.kb.domain.type.KbJobStatus;
import com.hbs.hsbbo.admin.ai.kb.domain.type.KbJobType;
import com.hbs.hsbbo.common.AuditBase.AuditBase;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "kb_job")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KbJob extends AuditBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 어떤 문서를 처리하는 Job인지
    @Column(name = "kb_document_id", nullable = false)
    private Long kbDocumentId;

    // Job 타입: INGEST / REINDEX / DELETE_VECTOR 등
    @Enumerated(EnumType.STRING)
    @Column(name = "job_type", nullable = false, length = 30)
    private KbJobType jobType;

    // 상태: READY / RUNNING / DONE / FAILED
    @Enumerated(EnumType.STRING)
    @Column(name = "job_status", nullable = false, length = 30)
    private KbJobStatus jobStatus;

    // 워커가 처리할 payload (Python hsbs-brain 전달용)
    @Column(name = "payload_json", columnDefinition = "json")
    private String payloadJson;

    // 재시도 횟수
    @Column(name = "try_count", nullable = false)
    private Integer tryCount;

    // 마지막 에러
    @Column(name = "last_error", columnDefinition = "text")
    private String lastError;

    // 스케줄링/처리시간(선택)
    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    @PrePersist
    protected void onCreate() {
        // AuditBase.prePersist()가 자동 호출되진 않으니 필요하면 수동 호출
        // (AuditBase에 @PrePersist가 있으면 JPA가 둘 다 호출해주긴 하지만, 안전하게 유지하고 싶다면 super 호출 패턴도 가능)
        if (this.tryCount == null) this.tryCount = 0;
    }
}
