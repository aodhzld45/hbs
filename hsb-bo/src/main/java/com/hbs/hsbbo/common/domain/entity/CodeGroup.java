package com.hbs.hsbbo.common.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "code_group")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CodeGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code_group_id", unique = true, nullable = false)
    private String codeGroupId;

    @Column(name = "group_name", length = 200, nullable = false)
    private String groupName;

    @Column(name = "description", length = 500)
    private String description;

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
