package com.hbs.hsbbo.admin.domain.entity.page;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "page_section")
@Getter
@Setter
@NoArgsConstructor
public class PageSection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "page_id")
    private CustomPage page;

    @Column(name = "section_name")
    private String sectionName;

    @Column(name = "layout_type")
    private String layoutType;

    @Column(name = "option_json", columnDefinition = "json")
    private String optionJson;

    @Column(name = "order_seq")
    private Integer orderSeq;

    @Column(name = "use_tf")
    private String useTf = "Y";

    @Column(name = "del_tf")
    private String delTf = "N";

    @Column(name = "reg_adm")
    private String regAdm;

    @Column(name = "reg_date")
    private LocalDateTime regDate;

    @Column(name = "up_adm")
    private String upAdm;

    @Column(name = "up_date")
    private LocalDateTime upDate;

    @Column(name = "del_adm")
    private String delAdm;

    @Column(name = "del_date")
    private LocalDateTime delDate;
}
