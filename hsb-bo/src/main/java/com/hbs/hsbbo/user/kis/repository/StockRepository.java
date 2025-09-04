package com.hbs.hsbbo.user.kis.repository;

import com.hbs.hsbbo.user.kis.domain.entity.Stock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {

    // 자동완성용: 심볼 prefix 또는 이름 부분일치 (활성만), 정렬 가중치
    @Query("""
        SELECT s FROM Stock s
        WHERE s.useTf='Y' AND s.delTf='N' AND
             ( s.symbol LIKE CONCAT(:q, '%')
               OR LOWER(s.name) LIKE LOWER(CONCAT('%', :q, '%')) )
        ORDER BY
             CASE
               WHEN s.symbol = :q THEN 0
               WHEN s.symbol LIKE CONCAT(:q, '%') THEN 1
               WHEN LOWER(s.name) LIKE LOWER(CONCAT(:q, '%')) THEN 2
               ELSE 3
             END,
             s.market, s.symbol
        """)
    Page<Stock> autoComplete(@Param("q") String q, Pageable pageable);

    // 사용자가 '삼성전자' 혹은 '005930'을 엔터로 확정했을 때 1건 해석
    @Query("""
        SELECT s FROM Stock s
        WHERE s.useTf='Y' AND s.delTf='N' AND
             ( s.symbol = :q OR LOWER(s.name) = LOWER(:q) )
        """)
    Optional<Stock> resolveExact(@Param("q") String q);
}