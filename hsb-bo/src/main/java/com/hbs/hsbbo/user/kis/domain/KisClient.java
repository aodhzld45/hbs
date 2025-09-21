package com.hbs.hsbbo.user.kis.domain;

import com.hbs.hsbbo.user.kis.dto.KisDailyItemChartPriceResponse;
import com.hbs.hsbbo.user.kis.dto.StockSearchDto;
import com.hbs.hsbbo.user.kis.service.KisAuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Supplier;
import java.util.stream.Collectors;

@Slf4j
@Component
public class KisClient {
    private final WebClient webClient;
    private final KisAuthService auth;

    public KisClient(@Qualifier("kisWebClient") WebClient webClient,
                    KisAuthService auth) {
        this.webClient = webClient;
        this.auth = auth;
    }

    //@Value("${kis.domain}")     private String domain;
    @Value("${kis.app-key}")    private String appKey;
    @Value("${kis.app-secret}") private String appSecret;

    private Map<String,String> headers(String trId){
        return Map.of(
                "authorization", "Bearer " + auth.getAccessToken(),
                "appkey", appKey,
                "appsecret", appSecret,
                "tr_id", trId
        );
    }

    private <T> T callWithRefresh(Supplier<T> call){
        try { return call.get(); }
        catch (WebClientResponseException e){
            log.error("[KIS] call error {} {} body={}", e.getRawStatusCode(), e.getStatusText(), e.getResponseBodyAsString());
            if (e.getRawStatusCode() == 401){
                log.warn("[KIS] 401 -> force token refresh & retry");
                auth.forceRefresh();
                return call.get();
            }
            throw e;
        }
    }

    /** 현재가 조회 */
    public Map<String,Object> inquirePrice(String code){
        final String path = "/uapi/domestic-stock/v1/quotations/inquire-price";  //  상대경로만
        log.debug("[KIS] GET {}", path);
        return callWithRefresh(() ->
                webClient.get()
                        .uri(b -> b.path(path)
                                .queryParam("FID_COND_MRKT_DIV_CODE","J")
                                .queryParam("FID_INPUT_ISCD", code)
                                .build())
                        .headers(h -> headers("FHKST01010100").forEach(h::add))
                        .accept(MediaType.APPLICATION_JSON)
                        .retrieve()
                        .bodyToMono(Map.class)
                        .block()
        );
    }

    /** 일별 시세 조회 */
    public Map<String,Object> inquireDaily(String code, String period){
        final String path = "/uapi/domestic-stock/v1/quotations/inquire-daily-price"; // 상대경로만
        log.debug("[KIS] GET {}", path);
        return callWithRefresh(() ->
                webClient.get()
                        .uri(b -> b.path(path)
                                .queryParam("FID_COND_MRKT_DIV_CODE","J")
                                .queryParam("FID_INPUT_ISCD", code)
                                .queryParam("FID_PERIOD_DIV_CODE", period)
                                .queryParam("FID_ORG_ADJ_PRC","0")
                                .build())
                        .headers(h -> headers("FHKST01010400").forEach(h::add))
                        .accept(MediaType.APPLICATION_JSON)
                        .retrieve()
                        .bodyToMono(Map.class)
                        .block()
        );
    }

    /** 국내주식기간별시세(일/주/월/년)[v1_국내주식-016] */
    // 2-1) 원본 응답 받기
    public KisDailyItemChartPriceResponse inquireDailyItemChartPriceRaw(
            String code, String fromYmd, String toYmd, String periodDiv /* D/W/M/Y */, String adj /* 0:수정,1:원주가 */
    ){
        final String path = "/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice";
        log.debug("[KIS] GET {}", path);

        return callWithRefresh(() ->
                webClient.get()
                        .uri(b -> b.path(path)
                                .queryParam("FID_COND_MRKT_DIV_CODE", "J")
                                .queryParam("FID_INPUT_ISCD", code)
                                .queryParam("FID_INPUT_DATE_1", fromYmd)
                                .queryParam("FID_INPUT_DATE_2", toYmd)
                                .queryParam("FID_PERIOD_DIV_CODE", periodDiv)
                                .queryParam("FID_ORG_ADJ_PRC", adj)
                                .build())
                        .headers(h -> headers("FHKST03010100").forEach(h::add)) // 실전 TR
                        .accept(MediaType.APPLICATION_JSON)
                        .retrieve()
                        .bodyToMono(KisDailyItemChartPriceResponse.class)
                        .block()
        );
    }

    // 2-2) LocalDate 입력 + Candle 리스트로 바로 변환해서 받기
    public List<KisDailyItemChartPriceResponse.ResponseBodyOutput2> inquireDailyItemChartPrice(
            String code, LocalDate from, LocalDate to, String periodDiv, String adj
    ){
        var resp = inquireDailyItemChartPriceRaw(
                code,
                from.format(DateTimeFormatter.BASIC_ISO_DATE), // yyyyMMdd
                to.format(DateTimeFormatter.BASIC_ISO_DATE),
                periodDiv, adj
        );
        if (resp == null || resp.getBody() == null || resp.getBody().getOutput2() == null) {
            return List.of();
        }
        return resp.getBody().getOutput2();
    }

    public List<CandleDto> inquireDailyItemChartPriceCandles(
            String code, LocalDate from, LocalDate to, String periodDiv, String adj
    ){
        var resp = inquireDailyItemChartPriceRaw(
                code,
                from.format(DateTimeFormatter.BASIC_ISO_DATE),
                to.format(DateTimeFormatter.BASIC_ISO_DATE),
                periodDiv, adj
        );
        return (resp == null) ? List.of()
                : resp.toCandles().stream()
                .map(c -> new CandleDto(c.getTradeDate(), c.getOpen(), c.getHigh(), c.getLow(), c.getClose(), c.getVolume()))
                .toList();
    }

    /**  길어진 범위를 안전하게 분할 호출 (일/주/월/년 공통) */
    public List<CandleDto> inquireDailyItemChartPriceCandlesChunked(
            String code, LocalDate from, LocalDate to, String periodDiv, String adj
    ) {
        final int MAX_SPAN = switch (periodDiv) {
            case "D" -> 100;
            case "W" -> 260;
            case "M" -> 600;
            case "Y" -> 2000;
            default -> 100;
        };

        List<CandleDto> all = new ArrayList<>();
        LocalDate cursor = from;

        while (!cursor.isAfter(to)) {
            LocalDate end = switch (periodDiv) {
                case "D" -> cursor.plusDays(MAX_SPAN - 1);
                case "W" -> cursor.plusWeeks(MAX_SPAN - 1);
                case "M" -> cursor.plusMonths(MAX_SPAN - 1);
                case "Y" -> cursor.plusYears(MAX_SPAN - 1);
                default  -> cursor.plusDays(MAX_SPAN - 1);
            };
            if (end.isAfter(to)) end = to;

            all.addAll(inquireDailyItemChartPriceCandles(code, cursor, end, periodDiv, adj));

            // 다음 구간으로 전진
            cursor = switch (periodDiv) {
                case "D" -> end.plusDays(1);
                case "W" -> end.plusWeeks(1);
                case "M" -> end.plusMonths(1);
                case "Y" -> end.plusYears(1);
                default  -> end.plusDays(1);
            };
        }

        //  중복제거 + 정렬
        return all.stream()
                .filter(c -> c.date() != null) // null 안전
                .collect(Collectors.toMap(
                        CandleDto::date, c -> c,
                        (a, b) -> b, // 중복 시 최신값
                        HashMap::new
                ))
                .values().stream()
                .sorted(Comparator.comparing(CandleDto::date))
                .toList();
    }

    // 차트 공용 DTO (record로 간단)
    public record CandleDto(LocalDate date, BigDecimal open, BigDecimal high,
                            BigDecimal low, BigDecimal close, Long volume) { }

    public List<StockSearchDto> searchStocks(String keyword) {
        final String path = "/uapi/domestic-stock/v1/quotations/inquire-issuemaster";
        log.debug("[KIS] SEARCH {}", keyword);

        return callWithRefresh(() ->
                webClient.get()
                        .uri(b -> b.path(path)
                                .queryParam("FID_COND_MRKT_DIV_CODE","J")  // 주식시장
                                .queryParam("FID_INPUT_ISCD", keyword)    // 종목코드 or 이름 키워드
                                .queryParam("FID_DIV_CLS_CODE","0")
                                .queryParam("FID_BLNG_CLS_CODE","0")
                                .queryParam("FID_TRGT_CLS_CODE","111111111")
                                .queryParam("FID_TRGT_EXLS_CLS_CODE","000000")
                                .build())
                        .headers(h -> headers("FHKST01010100").forEach(h::add))
                        .accept(MediaType.APPLICATION_JSON)
                        .retrieve()
                        .bodyToMono(Map.class)
                        .map(resp -> {
                            Object out = resp.get("output");
                            if (out instanceof List<?> list) {
                                return list.stream()
                                        .filter(Map.class::isInstance)
                                        .map(m -> (Map<String,Object>) m)
                                        .map(m -> new StockSearchDto(
                                                (String) m.get("stck_shrn_iscd"),  // 종목코드
                                                (String) m.get("hts_kor_isnm")     // 종목명
                                        ))
                                        .toList();
                            }
                            return List.<StockSearchDto>of();
                        })
                        .block()
        );
    }

}
