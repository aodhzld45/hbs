package com.hbs.hsbbo.admin.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_role_menu")
@Getter
@Setter
@NoArgsConstructor
@ToString
public class AdminRoleMenu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private AdminRole role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_id", nullable = false)
    private AdminMenu menu;

    @Column(name = "read_tf", length = 1)
    private String readTf; // 기본값 Y

    @Column(name = "write_tf", length = 1)
    private String writeTf; // 기본값 N

    @Column(name = "delete_tf", length = 1)
    private String deleteTf; // 기본값 N

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (readTf == null) readTf = "Y";
        if (writeTf == null) writeTf = "N";
        if (deleteTf == null) deleteTf = "N";
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
