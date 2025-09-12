package com.hbs.hsbbo.user.kis.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * KIS: 국내주식기간별시세(일/주/월/년)
 * URL: /uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice
 * TR : FHKST03010100 (문서 기준)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class KisDailyItemChartPriceResponse {
    /** 응답 헤더 */
    @JsonProperty("header")
    private ResponseHeader header;

    /** 응답 바디 */
    @JsonProperty("body")
    private ResponseBody body;

    // ===== nested types =====

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ResponseHeader {
        @JsonProperty("content-type") private String contentType; // 컨텐츠타입
        @JsonProperty("tr_id")        private String trId;        // 거래ID
        @JsonProperty("tr_cont")      private String trCont;      // 연속 거래 여부
        @JsonProperty("gt_uid")       private String gtUid;       // Global UID
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ResponseBody {
        @JsonProperty("rt_cd")  private String rtCd;   // 성공 실패 여부
        @JsonProperty("msg_cd") private String msgCd;  // 응답코드
        @JsonProperty("msg1")   private String msg1;   // 응답메세지
        @JsonProperty("output1") private ResponseBodyOutput1 output1;      // 요약
        @JsonProperty("output2") private List<ResponseBodyOutput2> output2; // 시계열
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ResponseBodyOutput1 {
        @JsonProperty("prdy_vrss")              private String prdyVrss;            // 전일 대비
        @JsonProperty("prdy_vrss_sign")         private String prdyVrssSign;        // 전일 대비 부호
        @JsonProperty("prdy_ctrt")              private String prdyCtrt;            // 전일 대비율
        @JsonProperty("stck_prdy_clpr")         private String stckPrdyClpr;        // 전일 종가
        @JsonProperty("acml_vol")               private String acmlVol;             // 누적 거래량
        @JsonProperty("acml_tr_pbmn")           private String acmlTrPbmn;          // 누적 거래 대금
        @JsonProperty("hts_kor_isnm")           private String htsKorIsnm;          // 종목명
        @JsonProperty("stck_prpr")              private String stckPrpr;            // 현재가
        @JsonProperty("stck_shrn_iscd")         private String stckShrnIscd;        // 단축코드
        @JsonProperty("prdy_vol")               private String prdyVol;
        @JsonProperty("stck_mxpr")              private String stckMxpr;
        @JsonProperty("stck_llam")              private String stckLlam;
        @JsonProperty("stck_oprc")              private String stckOprc;            // 시가
        @JsonProperty("stck_hgpr")              private String stckHgpr;            // 고가
        @JsonProperty("stck_lwpr")              private String stckLwpr;            // 저가
        @JsonProperty("stck_prdy_oprc")         private String stckPrdyOprc;
        @JsonProperty("stck_prdy_hgpr")         private String stckPrdyHgpr;
        @JsonProperty("stck_prdy_lwpr")         private String stckPrdyLwpr;
        @JsonProperty("askp")                   private String askp;
        @JsonProperty("bidp")                   private String bidp;
        @JsonProperty("prdy_vrss_vol")          private String prdyVrssVol;
        @JsonProperty("vol_tnrt")               private String volTnrt;
        @JsonProperty("stck_fcam")              private String stckFcam;
        @JsonProperty("lstn_stcn")              private String lstnStcn;
        @JsonProperty("cpfn")                   private String cpfn;
        @JsonProperty("hts_avls")               private String htsAvls;
        @JsonProperty("per")                    private String per;
        @JsonProperty("eps")                    private String eps;
        @JsonProperty("pbr")                    private String pbr;
        @JsonProperty("itewhol_loan_rmnd_ratem") private String itewholLoanRmndRatem;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ResponseBodyOutput2 {
        @JsonProperty("stck_bsop_date") private String stckBsopDate; // 영업일자 yyyyMMdd
        @JsonProperty("stck_clpr")      private String stckClpr;     // 종가
        @JsonProperty("stck_oprc")      private String stckOprc;     // 시가
        @JsonProperty("stck_hgpr")      private String stckHgpr;     // 고가
        @JsonProperty("stck_lwpr")      private String stckLwpr;     // 저가
        @JsonProperty("acml_vol")       private String acmlVol;      // 누적 거래량
        @JsonProperty("acml_tr_pbmn")   private String acmlTrPbmn;   // 누적 거래 대금
        @JsonProperty("flng_cls_code")  private String flngClsCode;  // 락 구분
        @JsonProperty("prtt_rate")      private String prttRate;     // 분할 비율
        @JsonProperty("mod_yn")         private String modYn;        // 변경 여부
        @JsonProperty("prdy_vrss_sign") private String prdyVrssSign; // 전일 대비 부호
        @JsonProperty("prdy_vrss")      private String prdyVrss;     // 전일 대비
        @JsonProperty("revl_issu_reas") private String revlIssuReas; // 재평가사유코드

        // ===== 편의 파서 =====
        private static final DateTimeFormatter YMD = DateTimeFormatter.ofPattern("yyyyMMdd");

        public LocalDate tradeDate() { return LocalDate.parse(stckBsopDate, YMD); }
        public BigDecimal open()     { return new BigDecimal(stckOprc); }
        public BigDecimal high()     { return new BigDecimal(stckHgpr); }
        public BigDecimal low()      { return new BigDecimal(stckLwpr); }
        public BigDecimal close()    { return new BigDecimal(stckClpr); }
        public long volume()         { return Long.parseLong(acmlVol); }
    }

    // ===== 차트용 변환 =====
    public List<CandleDto> toCandles() {
        if (body == null || body.getOutput2() == null) return List.of();
        return body.getOutput2().stream()
                .map(o -> new CandleDto(
                        o.tradeDate(), o.open(), o.high(), o.low(), o.close(), o.volume()
                ))
                .toList();
    }


    /** 차트 공용 DTO */
    @Getter @AllArgsConstructor
    public static class CandleDto {
        private final LocalDate tradeDate;
        private final BigDecimal open;
        private final BigDecimal high;
        private final BigDecimal low;
        private final BigDecimal close;
        private final Long volume;
    }

}
