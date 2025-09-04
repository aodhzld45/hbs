package com.hbs.hsbbo.user.kis.domain.entity;

import com.hbs.hsbbo.common.AuditBase.AuditBase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "stocks")
@Getter
@Setter
public class Stock extends AuditBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "symbol", unique = true, nullable = false, length = 20)
    private String symbol;  // 종목코드 (6자리)

    @Column(name = "name", nullable = false, length = 100)
    private String name;    // 종목명

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "market", nullable = false, length = 10)
    private String market;  // 시장 (KOSPI, KOSDAQ)

    @Column(name = "sector", length = 50)
    private String sector;  // 섹터/업종

    @Column(name = "tags", length = 255)
    private String tags;    // 태그

    @PrePersist
    @Override
    protected void prePersist() {
        super.prePersist();
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

}
