package com.hbs.hsbbo.user.kis.controller;

import com.hbs.hsbbo.user.kis.dto.StockMasterResponse;
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

    // 자동완성
    @GetMapping("/search")
    public List<StockMasterResponse> search(@RequestParam("q") String q,
                                            @RequestParam(defaultValue="10") int size) {
        List<StockMasterResponse> response = stockMasterService.suggest(q, size);
        return response;
    }

    // 단건 해석
    @GetMapping("/resolve")
    public ResponseEntity<?> resolve(@RequestParam("q") String q) {
        return stockMasterService.resolve(q)
                .<ResponseEntity<?>>map(s -> ResponseEntity.ok(StockMasterResponse.fromEntity(s)))
                .orElseGet(() -> ResponseEntity.status(404)
                        .body(Map.of("message", "종목을 찾지 못함", "q", q)));
    }

}
