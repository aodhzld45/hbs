package com.hbs.hsbbo.admin.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_log")
@Getter
@Setter
@ToString
public class AdminLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admin_id", length = 50, nullable = false)
    private String adminId;

    @Column(length = 50, nullable = false)
    private String action;

    @Column(length = 200)
    private String url;

    @Column(columnDefinition = "TEXT")
    private String params;

    @Column(length = 50)
    private String ip;

    @Column(name = "log_date", nullable = false)
    private LocalDateTime logDate;

    @Column(name = "use_tf", length = 1)
    private String useTf = "Y";

    @Column(name = "del_tf", length = 1)
    private String delTf = "N";

    @Column(name = "reg_adm", length = 50)
    private String regAdm;

    @Column(name = "reg_date")
    private LocalDateTime regDate;

    @Column(name = "up_adm", length = 50)
    private String upAdm;

    @Column(name = "up_date")
    private LocalDateTime upDate;

    @Column(name = "del_adm", length = 50)
    private String delAdm;

    @Column(name = "del_date")
    private LocalDateTime delDate;
}
