package com.hbs.hsbbo.admin.domain.entity;

import com.hbs.hsbbo.common.AuditBase.AuditBase;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "app_cors_origin",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_app_cors_origin_pat", columnNames = {"tenant_id", "origin_pat"})
        },
        indexes = {
                @Index(name = "idx_app_cors_use_del", columnList = "use_tf, del_tf")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class AppCorsOrigin extends AuditBase {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        /** 허용 패턴 (예: https://www.hsbs.kr, https://*.partner.com, http://localhost:5173) */
        @Column(name = "origin_pat", nullable = false, length = 255)
        private String originPat;

        @Column(name = "description", length = 255)
        private String description;

        /** 선택: 테넌트/사이트 분리 시 사용 (멀티테넌트가 아니면 null 유지) */
        @Column(name = "tenant_id", length = 50)
        private String tenantId;

}