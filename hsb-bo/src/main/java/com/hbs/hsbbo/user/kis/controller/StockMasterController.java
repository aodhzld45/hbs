package com.hbs.hsbbo.user.kis.controller;

import com.hbs.hsbbo.user.kis.domain.entity.StockMaster;
import com.hbs.hsbbo.user.kis.service.StockMasterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stock-master")
@RequiredArgsConstructor
public class StockMasterController {

    private final StockMasterService stockMasterService;

    record SimpleStockMaster(String symbol, String name, String market) {
        static SimpleStockMaster of(StockMaster s){ return new SimpleStockMaster(s.getSymbol(), s.getName(), s.getMarket()); }
    }

    // 자동완성
    @GetMapping("/search")
    public List<SimpleStockMaster> search(@RequestParam("q") String q,
                                    @RequestParam(defaultValue="10") int size) {
        return stockMasterService.suggest(q, size).stream().map(SimpleStockMaster::of).toList();
    }

    // 단건 해석(입력 확정 시): 반환 심볼로 KIS 호출
    @GetMapping("/resolve")
    public ResponseEntity<?> resolve(@RequestParam("q") String q) {
        return stockMasterService.resolve(q)
                .<ResponseEntity<?>>map(s -> ResponseEntity.ok(StockMasterController.SimpleStockMaster.of(s)))
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of("message","종목을 찾지 못함","q",q)));
    }
}
