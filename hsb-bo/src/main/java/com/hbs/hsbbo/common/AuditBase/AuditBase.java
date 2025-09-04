// com.hbs.hsbbo.common.domain.AuditBase
package com.hbs.hsbbo.common.AuditBase;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
@MappedSuperclass
@Getter @Setter
// 공통 감사 필드 (선택: 재사용용)
public abstract class AuditBase {

    @Column(name = "use_tf", nullable = false, length = 1)
    private String useTf = "Y";

    @Column(name = "del_tf", nullable = false, length = 1)
    private String delTf = "N";

    @Column(name = "reg_adm", length = 50)
    private String regAdm;

    @Column(name = "reg_date")
    private LocalDateTime regDate;

    @Column(name = "up_adm", length = 50)
    private String upAdm;

    @Column(name = "up_date")
    private LocalDateTime upDate;

    @Column(name = "del_adm")
    private String delAdm;

    @Column(name = "del_date")
    private LocalDateTime delDate;

    @PrePersist
    protected void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (this.regDate == null) {
            this.regDate = now;
        }
        if (this.upDate == null) {
            this.upDate = now;
        }
    }

}
