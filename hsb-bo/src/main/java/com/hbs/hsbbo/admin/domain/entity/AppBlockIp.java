package com.hbs.hsbbo.admin.domain.entity;

import com.hbs.hsbbo.common.AuditBase.AuditBase;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "app_block_ip",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_app_block_ip_ip_address", columnNames = {"ip_address"})
        },
        indexes = {
                @Index(name = "idx_app_block_ip_use_del", columnList = "use_tf, del_tf"),
                @Index(name = "idx_app_block_ip_reg_date", columnList = "reg_date")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class AppBlockIp extends AuditBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ip_address", nullable = false, length = 45)
    private String ipAddress;

    @Column(name = "description", length = 255)
    private String description;
}
