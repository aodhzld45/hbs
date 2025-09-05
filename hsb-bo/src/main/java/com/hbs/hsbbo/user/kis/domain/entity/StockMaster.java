package com.hbs.hsbbo.user.kis.domain.entity;

import com.hbs.hsbbo.common.AuditBase.AuditBase;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "stock_master",
        indexes = {
                @Index(name = "ix_stock_master_symbol", columnList = "symbol"),
                @Index(name = "ix_stock_master_isin", columnList = "isin")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_stock_master_isin", columnNames = "isin"),
                @UniqueConstraint(name = "uk_stock_master_symbol", columnNames = "symbol")
        })
public class StockMaster extends AuditBase {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, length=20)
    private String isin;

    @Column(name = "symbol", unique = true, nullable = false, length = 20)
    private String symbol;  // 종목코드 (6자리)

    @Column(nullable=false, length=100)
    private String name;     // 한글 종목명

    @Column(name = "short_name",length=100)
    private String shortName;

    @Column(name = "eng_name",length=200)
    private String engName;

    @Column(name = "listed_date")
    private LocalDate listedDate;

    @Column(nullable=false, length=20)
    private String market;

    @Column(name = "sec_type", length=20)
    private String secType;

    @Column(length=50)
    private String sector;

    @Column(name = "stock_type", length=20)
    private String stockType;

    @Column(name = "par_value")
    private Integer parValue;

    @Column(name = "listed_shares")
    private Long listedShares;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    @Override
    protected void prePersist() {
        super.prePersist();
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
