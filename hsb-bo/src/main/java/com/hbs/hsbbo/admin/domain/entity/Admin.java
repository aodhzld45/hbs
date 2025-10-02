package com.hbs.hsbbo.admin.domain.entity;

import com.hbs.hsbbo.admin.domain.type.AdminStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin")
@Data
public class Admin {

    @Id
    @Column(length = 100)
    private String id;

    @Column(name = "group_id")
    private Integer groupId;

    @Column(length = 100)
    private String email;

    @Column(length = 100)
    private String name;

    @Column(length = 100)
    private String password;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(length = 100)
    private String tel;

    @Column(length = 100)
    private String memo;

    @Column(name = "password_length")
    private Integer passwordLength;

    @Column(name = "access_fail_count")
    private Integer accessFailCount;

    @Column(name = "is_deleted")
    private Boolean isDeleted;

    @Column(name = "logged_at")
    private LocalDateTime loggedAt;

    @Column(name = "password_updated_at")
    private LocalDateTime passwordUpdatedAt;

    // 1. 로그인 관련
    @Column(name = "last_login_ip", length = 45)
    private String lastLoginIp;

    @Column(name = "last_login_device", length = 255)
    private String lastLoginDevice;

    @Column(name = "last_login_location", length = 255)
    private String lastLoginLocation;

    // 2. 계정 보안 관련
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 16, nullable = false)
    private AdminStatus status = AdminStatus.ACTIVE;

    // 3. 운영·감사 추적
    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
