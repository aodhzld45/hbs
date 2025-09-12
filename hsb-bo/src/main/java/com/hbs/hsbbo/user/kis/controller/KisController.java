package com.hbs.hsbbo.user.kis.controller;

import com.hbs.hsbbo.user.kis.domain.KisClient;
import com.hbs.hsbbo.user.kis.dto.KisDailyItemChartPriceResponse;
import com.hbs.hsbbo.user.kis.dto.StockSearchDto;
import com.hbs.hsbbo.user.kis.service.KisAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/kis")
@RequiredArgsConstructor
public class KisController {
    private final KisClient kis;
    private final KisAuthService auth;

    /** 현재가 조회 */
    @GetMapping("/price")
    @Cacheable(cacheNames="price", key="#code")
    public ResponseEntity<Map<String,Object>> price(@RequestParam String code){
        return ResponseEntity.ok(kis.inquirePrice(code));
    }

    /** 일별 시세 조회 */
    @GetMapping("/history")
    @Cacheable(cacheNames="history", key="#code+':'+#period")
    public ResponseEntity<Map<String,Object>> history(@RequestParam String code,
                                                      @RequestParam(defaultValue="D") String period){
        return ResponseEntity.ok(kis.inquireDaily(code, period));
    }

    /**
     * 차트 데이터(일/주/월/년) – Candle 리스트로 바로 반환
     * period: D(일), W(주), M(월), Y(년)
     * adj   : 0(수정주가), 1(원주가)
     */
    @GetMapping("/chart/daily")
    @Cacheable(cacheNames = "chart_daily",
            key = "#code + ':' + #from + ':' + #to + ':' + #period + ':' + #adj")
    public ResponseEntity<List<KisClient.CandleDto>> chartDaily(
            @RequestParam String code,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "D") String period,
            @RequestParam(defaultValue = "0") String adj
    ) {
        // 유효성 간단 체크
        if (to.isBefore(from)) {
            return ResponseEntity.badRequest().build();
        }
        var candles = kis.inquireDailyItemChartPriceCandles(code, from, to, period, adj);
        return ResponseEntity.ok(candles);
    }

    /**
     * (옵션) 원본 응답을 그대로 보고 싶을 때 – 디버깅/검증 용
     */
    @GetMapping("/chart/daily/raw")
    @Cacheable(cacheNames = "chart_daily_raw",
            key = "#code + ':' + #from + ':' + #to + ':' + #period + ':' + #adj")
    public ResponseEntity<KisDailyItemChartPriceResponse> chartDailyRaw(
            @RequestParam String code,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "D") String period,
            @RequestParam(defaultValue = "0") String adj
    ) {
        var resp = kis.inquireDailyItemChartPriceRaw(
                code,
                from.format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE), // yyyyMMdd
                to.format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE),
                period, adj
        );
        return ResponseEntity.ok(resp);
    }

    /** 종목명 검색 (자동완성용) */
    @GetMapping("/search")
    public ResponseEntity<List<StockSearchDto>> search(@RequestParam String keyword){
        return ResponseEntity.ok(kis.searchStocks(keyword));
    }


}
