package com.hbs.hsbbo.admin.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "adm_menu")
@Data
public class AdminMenu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;  // 시퀀스값, AUTO_INCREMENT

    @Column(nullable = false, length = 100)
    private String name;  // 메뉴명

    @Column(nullable = false)
    private Byte depth;   // 뎁스 구분, TINYINT

    @Column(name = "parent_id")
    private Integer parentId;  // 2뎁스일 경우 부모 메뉴의 id

    @Column(length = 255)
    private String description; // 메모

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(nullable = false, length = 200)
    private String url;   // 주소

    @Column(name = "order_sequence", nullable = false)
    private Integer orderSequence; // 순서

    // VARCHAR로 처리하여 'Y' 또는 'N' 값을 저장
    @Column(name = "use_tf", nullable = false, length = 1)
    private String useTf;

    @Column(name = "del_tf", nullable = false, length = 1)
    private String delTf;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (useTf == null) useTf = "Y"; // 기본값 'Y' (사용)
        if (delTf == null) delTf = "N"; // 기본값 'N' (미삭제)
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
