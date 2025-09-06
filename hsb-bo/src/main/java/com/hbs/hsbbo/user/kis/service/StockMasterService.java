package com.hbs.hsbbo.user.kis.service;

import com.hbs.hsbbo.user.kis.domain.entity.StockMaster;
import com.hbs.hsbbo.user.kis.repository.StockMasterRepository;
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
public class StockMasterService {

    private final StockMasterRepository stockMasterRepository;

    @Transactional
    public List<StockMaster> suggest(String q, int size) {
        var page = stockMasterRepository.autoComplete(q.trim(), PageRequest.of(0, size));
        return page.getContent();
    }

    @Transactional
    public Optional<StockMaster> resolve(String q) {
        String t = q.trim();
        return stockMasterRepository.resolveExact(t)
                .or(() -> {
                    // 정확일치가 없으면 자동완성 1순위 후보를 반환(선택)
                    var top = stockMasterRepository.autoComplete(t, PageRequest.of(0, 1));
                    return top.isEmpty() ? Optional.empty() : Optional.of(top.getContent().get(0));
                });
    }

}
