package com.hbs.hsbbo.user.kis.domain.entity;

import com.hbs.hsbbo.common.AuditBase.AuditBase;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "stock_market_price",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_stock_market_price_symbol_date",
                        columnNames = {"symbol", "trade_date"}
                )
        },
        indexes = {
                @Index(name = "idx_smp_market", columnList = "market"),
                @Index(name = "idx_smp_trade_date", columnList = "trade_date")
        }
)
public class StockMarketPrice extends AuditBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 거래일(KST) */
    @Column(name = "trade_date", nullable = false)
    private LocalDate tradeDate;

    /** 종목코드(단축코드, 예: 005930) */
    @Column(name = "symbol", length = 20, nullable = false)
    private String symbol;

    /** 종목명(원본 그대로 저장) */
    @Column(name = "name_ko", length = 100)
    private String nameKo;

    /** 시장구분: KOSPI / KOSDAQ / KONEX */
    @Column(name = "market", length = 10)
    private String market; // 테이블상 NULL 허용

    /** 소속부(벤처기업부/중견기업부/기타) */
    @Column(name = "segment", length = 30)
    private String segment; // 테이블상 NULL 허용

    /** 종가 */
    @Column(name = "close", precision = 18, scale = 2)
    private BigDecimal close;

    /** 대비(전일 대비 가격) */
    @Column(name = "change_amt", precision = 18, scale = 2)
    private BigDecimal changeAmt;

    /** 등락률(%) */
    @Column(name = "change_rate", precision = 9, scale = 2)
    private BigDecimal changeRate;

    /** 시가/고가/저가 */
    @Column(name = "open", precision = 18, scale = 2)
    private BigDecimal open;

    @Column(name = "high", precision = 18, scale = 2)
    private BigDecimal high;

    @Column(name = "low", precision = 18, scale = 2)
    private BigDecimal low;

    /** 거래량(주) */
    @Column(name = "volume")
    private Long volume;

    /** 거래대금(원) */
    @Column(name = "amount")
    private Long amount;

    /** 시가총액(원) — 과학표기(E-notation) 대응 위해 BigDecimal */
    @Column(name = "market_cap", precision = 24, scale = 2)
    private BigDecimal marketCap;

    /** 상장주식수(주) */
    @Column(name = "listed_shares")
    private Long listedShares;
}