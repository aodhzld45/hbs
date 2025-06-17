package com.hbs.hsbbo.admin.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_menu")
@Getter
@Setter
public class UserMenu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", columnDefinition = "INT UNSIGNED")
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "depth", nullable = false)
    private Integer depth;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(name = "url", length = 200)
    private String url;

    @Column(name = "order_seq", nullable = false)
    private Integer orderSeq;

    @Column(name = "description", length = 255)
    private String description;

    // 공통 컬럼
    @Column(name = "use_tf", nullable = false, length = 1)
    private String useTf;

    @Column(name = "del_tf", nullable = false, length = 1)
    private String delTf;

    @Column(name = "reg_adm", length = 50)
    private String regAdm;

    @Column(name = "reg_date", columnDefinition = "DATETIME")
    private LocalDateTime regDate;

    @Column(name = "up_adm", length = 50)
    private String upAdm;

    @Column(name = "up_date", columnDefinition = "DATETIME")
    private LocalDateTime upDate;

    @Column(name = "del_adm", length = 50)
    private String delAdm;

    @Column(name = "del_date", columnDefinition = "DATETIME")
    private LocalDateTime delDate;
}
