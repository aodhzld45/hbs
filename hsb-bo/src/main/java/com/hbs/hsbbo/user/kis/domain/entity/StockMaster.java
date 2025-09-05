package com.hbs.hsbbo.user.kis.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_master",
        uniqueConstraints = {
                @UniqueConstraint(name="uk_isin", columnNames = "isin"),
                @UniqueConstraint(name="uk_symbol", columnNames = "symbol")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockMaster {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, length=20)
    private String isin;

    @Column(nullable=false, length=10)
    private String symbol;   // 단축코드(문자 포함 가능)

    @Column(nullable=false, length=100)
    private String name;     // 한글 종목명

    @Column(length=100)
    private String shortName;

    @Column(length=200)
    private String engName;

    private LocalDate listedDate;

    @Column(nullable=false, length=20)
    private String market;

    @Column(length=20)
    private String secType;

    @Column(length=50)
    private String sector;

    @Column(length=20)
    private String stockType;

    private Integer parValue;
    private Long listedShares;

    @Column(insertable=false, updatable=false)
    private LocalDateTime createdAt;

    @Column(insertable=false, updatable=false)
    private LocalDateTime updatedAt;
}
