package com.hbs.hsbbo.admin.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_role_user")
@Getter
@Setter
@ToString
@NoArgsConstructor
public class AdminRoleUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 관리자 계정(admin 테이블의 id와 연동)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", referencedColumnName = "id")
    private Admin admin; // 사용자

    // 관리자 권한 그룹 (admin_role 테이블의 id와 연동)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", referencedColumnName = "id")
    private AdminRole role; // 권한 그룹

    private LocalDateTime assignedAt;

}
