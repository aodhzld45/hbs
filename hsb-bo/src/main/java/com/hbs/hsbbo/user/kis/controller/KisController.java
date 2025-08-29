package com.hbs.hsbbo.user.kis.controller;

import com.hbs.hsbbo.user.kis.domain.KisClient;
import com.hbs.hsbbo.user.kis.dto.StockSearchDto;
import com.hbs.hsbbo.user.kis.service.KisAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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

    /** 종목명 검색 (자동완성용) */
    @GetMapping("/search")
    public ResponseEntity<List<StockSearchDto>> search(@RequestParam String keyword){
        return ResponseEntity.ok(kis.searchStocks(keyword));
    }


}
