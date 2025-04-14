// com.hbs.hsbbo.userlog.entity.UserLog.java
package com.hbs.hsbbo.admin.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "userlog")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long logId;

    private String sid;
    private String ymd;
    private String yyyy;
    private String mm;
    private String dd;
    private String hh;
    private String mi;
    private String wk;

    private String depth01;
    private String depth02;
    private String depth03;

    private String url;
    private String param01;
    private String param02;
    private String param03;

    private String pageType;
    private String diviceType;
    private String referer;
    private String refIp;
    private LocalDateTime logDate;

    private Integer dispSeq;
    private String useTF;
    private String delTF;

    private Long regAdm;
    private LocalDateTime regDate;
    private Long modifyAdm;
    private LocalDateTime modifyDate;
    private Long delAdm;
    private LocalDateTime delDate;
}
