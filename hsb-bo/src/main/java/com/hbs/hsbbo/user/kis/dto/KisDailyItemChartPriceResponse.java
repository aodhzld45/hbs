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
 * TR : FHKST03010100
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class KisDailyItemChartPriceResponse {

    @JsonProperty("header")
    private ResponseHeader header;

    @JsonProperty("body")
    private ResponseBody body;

//    @JsonProperty("output1")
//    private List<ResponseBodyOutput1> flatOutput1;

    @JsonProperty("output2")
    private List<ResponseBodyOutput2> flatOutput2;

    /* ====== Nested Types ====== */

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ResponseHeader {
        @JsonProperty("content-type") private String contentType;
        @JsonProperty("tr_id")        private String trId;
        @JsonProperty("tr_cont")      private String trCont;
        @JsonProperty("gt_uid")       private String gtUid;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ResponseBody {
        @JsonProperty("rt_cd")   private String rtCd;
        @JsonProperty("msg_cd")  private String msgCd;
        @JsonProperty("msg1")    private String msg1;
        @JsonProperty("output1") private ResponseBodyOutput1 output1;
        @JsonProperty("output2") private List<ResponseBodyOutput2> output2;
    }

    /* output1: 요약 (시세 개요) */
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ResponseBodyOutput1 {
        @JsonProperty("prdy_vrss")   private String prdyVrss;
        @JsonProperty("prdy_vrss_sign") private String prdyVrssSign;
        @JsonProperty("prdy_ctrt")   private String prdyCtrt;
        @JsonProperty("stck_prdy_clpr") private String stckPrdyClpr;
        @JsonProperty("acml_vol")    private String acmlVol;
        @JsonProperty("acml_tr_pbmn") private String acmlTrPbmn;
        @JsonProperty("hts_kor_isnm") private String htsKorIsnm;
        @JsonProperty("stck_prpr")   private String stckPrpr;
        @JsonProperty("stck_shrn_iscd") private String stckShrnIscd;
        @JsonProperty("prdy_vol")    private String prdyVol;
        @JsonProperty("stck_mxpr")   private String stckMxpr;
        @JsonProperty("stck_llam")   private String stckLlam;
        @JsonProperty("stck_oprc")   private String stckOprc;
        @JsonProperty("stck_hgpr")   private String stckHgpr;
        @JsonProperty("stck_lwpr")   private String stckLwpr;
        @JsonProperty("stck_prdy_oprc") private String stckPrdyOprc;
        @JsonProperty("stck_prdy_hgpr") private String stckPrdyHgpr;
        @JsonProperty("stck_prdy_lwpr") private String stckPrdyLwpr;
        @JsonProperty("askp")        private String askp;
        @JsonProperty("bidp")        private String bidp;
        @JsonProperty("prdy_vrss_vol") private String prdyVrssVol;
        @JsonProperty("vol_tnrt")    private String volTnrt;
        @JsonProperty("stck_fcam")   private String stckFcam;
        @JsonProperty("lstn_stcn")   private String lstnStcn;
        @JsonProperty("cpfn")        private String cpfn;
        @JsonProperty("hts_avls")    private String htsAvls;
        @JsonProperty("per")         private String per;
        @JsonProperty("eps")         private String eps;
        @JsonProperty("pbr")         private String pbr;
        @JsonProperty("itewhol_loan_rmnd_ratem") private String itewholLoanRmndRatem;
    }

    /* output2: 개별 캔들 (시계열) */
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ResponseBodyOutput2 {
        @JsonProperty("stck_bsop_date") private String stckBsopDate;
        @JsonProperty("stck_clpr")      private String stckClpr;
        @JsonProperty("stck_oprc")      private String stckOprc;
        @JsonProperty("stck_hgpr")      private String stckHgpr;
        @JsonProperty("stck_lwpr")      private String stckLwpr;
        @JsonProperty("acml_vol")       private String acmlVol;
        @JsonProperty("acml_tr_pbmn")   private String acmlTrPbmn;
        @JsonProperty("flng_cls_code")  private String flngClsCode;
        @JsonProperty("prtt_rate")      private String prttRate;
        @JsonProperty("mod_yn")         private String modYn;
        @JsonProperty("prdy_vrss_sign") private String prdyVrssSign;
        @JsonProperty("prdy_vrss")      private String prdyVrss;
        @JsonProperty("revl_issu_reas") private String revlIssuReas;

        private static final DateTimeFormatter YMD = DateTimeFormatter.ofPattern("yyyyMMdd");
        private static BigDecimal dec(String s){ return (s==null||s.isBlank())? BigDecimal.ZERO : new BigDecimal(s); }
        private static long lng(String s){ return (s==null||s.isBlank())? 0L : Long.parseLong(s); }

        public LocalDate tradeDate() { return LocalDate.parse(stckBsopDate, YMD); }
        public BigDecimal open()     { return dec(stckOprc); }
        public BigDecimal high()     { return dec(stckHgpr); }
        public BigDecimal low()      { return dec(stckLwpr); }
        public BigDecimal close()    { return dec(stckClpr); }
        public long volume()         { return lng(acmlVol); }
    }

    /* ===== 변환 ===== */
    public List<CandleDto> toCandles() {
        List<ResponseBodyOutput2> src =
                (body != null && body.getOutput2() != null && !body.getOutput2().isEmpty())
                        ? body.getOutput2()
                        : flatOutput2;


        if (src == null || src.isEmpty()) return List.of();

        return src.stream()
                .map(o -> new CandleDto(o.tradeDate(), o.open(), o.high(), o.low(), o.close(), o.volume()))
                .toList();
    }

    @Getter @AllArgsConstructor
    public static class CandleDto {
        private final LocalDate tradeDate;
        private final BigDecimal open, high, low, close;
        private final Long volume;
    }
}
