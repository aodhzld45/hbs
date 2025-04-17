package com.hbs.hsbbo.common.domain.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "TBL_CODE_PARENT")
@Data
public class CodeParent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PCODE_NO")
    private Integer pcodeNo;

    @Column(name = "SITE_NO")
    private Integer siteNo;

    @Column(name = "PCODE", nullable = false, length = 50)
    private String pcode;

    @Column(name = "PCODE_NM", nullable = false, length = 50)
    private String pcodeNm;

    @Column(name = "PCODE_MEMO", columnDefinition = "TEXT")
    private String pcodeMemo;

    @Column(name = "PCODE_SEQ_NO")
    private Integer pcodeSeqNo;

    @Column(name = "USE_TF", nullable = false, length = 1)
    private String useTf;

    @Column(name = "DEL_TF", nullable = false, length = 1)
    private String delTf;

    @Column(name = "REG_ADM")
    private Integer regAdm;

    @Column(name = "REG_DATE", nullable = false, updatable = false)
    private LocalDateTime regDate;

    @Column(name = "UP_ADM")
    private Integer upAdm;

    @Column(name = "UP_DATE")
    private LocalDateTime upDate;

    @Column(name = "DEL_ADM")
    private Integer delAdm;

    @Column(name = "DEL_DATE")
    private LocalDateTime delDate;

    @OneToMany(mappedBy = "parent", fetch = FetchType.LAZY)
    private List<CodeDetail> details;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.regDate = now;
        this.upDate = now;
        if (this.useTf == null) this.useTf = "Y";
        if (this.delTf == null) this.delTf = "N";
    }

    @PreUpdate
    public void preUpdate() {
        this.upDate = LocalDateTime.now();
    }
}
