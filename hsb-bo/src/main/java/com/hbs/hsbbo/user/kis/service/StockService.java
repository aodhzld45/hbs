package com.hbs.hsbbo.user.kis.service;

import com.hbs.hsbbo.user.kis.domain.entity.Stock;
import com.hbs.hsbbo.user.kis.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockService {

    private final StockRepository stockRepository;

    @Transactional
    public List<Stock> suggest(String q, int size) {
        var page = stockRepository.autoComplete(q.trim(), PageRequest.of(0, size));
        return page.getContent();
    }

    @Transactional
    public Optional<Stock> resolve(String q) {
        String t = q.trim();
        return stockRepository.resolveExact(t)
                .or(() -> {
                    // 정확일치가 없으면 자동완성 1순위 후보를 반환(선택)
                    var top = stockRepository.autoComplete(t, PageRequest.of(0, 1));
                    return top.isEmpty() ? Optional.empty() : Optional.of(top.getContent().get(0));
                });
    }


}