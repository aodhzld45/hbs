package com.hbs.hsbbo.common.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "code_detail",
        uniqueConstraints = @UniqueConstraint(columnNames = {"code_group_id", "code_id"}))@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CodeDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "code_group_id", nullable = false)
    private CodeGroup codeGroup;

    @Column(name = "code_id", length = 50)
    private String codeId;

    @Column(name = "parent_code_id", length = 50)
    private String parentCodeId;

    @Column(name = "code_name_ko", length = 200, nullable = false)
    private String codeNameKo;

    @Column(name = "code_name_en", length = 200)
    private String codeNameEn;

    @Column(name = "order_seq")
    private Integer orderSeq;

    @Column(name = "use_tf", length = 1)
    private String useTf;

    @Column(name = "del_tf", length = 1)
    private String delTf;

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
