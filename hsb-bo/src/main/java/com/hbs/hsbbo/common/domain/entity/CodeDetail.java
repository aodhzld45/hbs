package com.hbs.hsbbo.common.domain.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "TBL_CODE_DETAIL")
@IdClass(CodeDetailId.class)
@Data
public class CodeDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DCODE_NO")
    private Long dcodeNo;

    @Id
    @Column(name = "PCODE", nullable = false, length = 50)
    private String pcode;

    @Column(name = "DCODE", nullable = false, length = 50)
    private String dcode;

    @Column(name = "DCODE_NM", nullable = false, length = 50)
    private String dcodeNm;

    @Column(name = "DCODE_EXT", nullable = false, length = 255)
    private String dcodeExt;

    @Column(name = "DCODE_SEQ_NO")
    private Integer dcodeSeqNo;

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

    @Column(name = "DCODE_INFO01", length = 150)
    private String dcodeInfo01;

    @Column(name = "DCODE_INFO02", length = 150)
    private String dcodeInfo02;

    @Column(name = "DCODE_INFO03", length = 150)
    private String dcodeInfo03;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name               = "PCODE",
            referencedColumnName = "PCODE",
            insertable         = false,
            updatable          = false
    )
    private CodeParent parent;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.regDate = now;
        this.upDate = now;
        if (this.useTf   == null) this.useTf   = "Y";
        if (this.delTf   == null) this.delTf   = "N";
    }

    @PreUpdate
    public void preUpdate() {
        this.upDate = LocalDateTime.now();
    }
}
