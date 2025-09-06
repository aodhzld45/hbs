package com.hbs.hsbbo.user.kis.repository;

import com.hbs.hsbbo.user.kis.domain.entity.StockMaster;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface StockMasterRepository extends JpaRepository<StockMaster, Long> {
    List<StockMaster> findAllByIsinIn(Collection<String> isins);

    List<StockMaster> findAllBySymbolIn(Collection<String> symbols);

    // 자동완성용: 심볼 prefix 또는 이름 부분일치 (활성만), 정렬 가중치
    @Query("""
        SELECT s FROM StockMaster s
        WHERE s.useTf='Y' AND s.delTf='N' AND
             ( s.symbol LIKE CONCAT(:q, '%')
               OR LOWER(s.shortName) LIKE LOWER(CONCAT('%', :q, '%')) )
        ORDER BY
             CASE
               WHEN s.symbol = :q THEN 0
               WHEN s.symbol LIKE CONCAT(:q, '%') THEN 1
               WHEN LOWER(s.shortName) LIKE LOWER(CONCAT(:q, '%')) THEN 2
               ELSE 3
             END,
             s.market, s.symbol
        """)
    Page<StockMaster> autoComplete(@Param("q") String q, Pageable pageable);

    // 사용자가 '삼성전자' 혹은 '005930'을 엔터로 확정했을 때 1건 해석
    @Query("""
        SELECT s FROM StockMaster s
        WHERE s.useTf='Y' AND s.delTf='N' AND
             ( s.symbol = :q OR LOWER(s.shortName) = LOWER(:q) )
        """)
    Optional<StockMaster> resolveExact(@Param("q") String q);

    @Modifying
    @Query("""
    UPDATE StockMaster s SET
      s.symbol = :symbol, s.name = :name, s.shortName = :shortName,
      s.engName = :engName, s.listedDate = :listedDate, s.market = :market,
      s.secType = :secType, s.sector = :sector, s.stockType = :stockType,
      s.parValue = :parValue, s.listedShares = :listedShares
    WHERE s.isin = :isin
  """)
    int updateByIsin(@Param("isin") String isin,
                     @Param("symbol") String symbol,
                     @Param("name") String name,
                     @Param("shortName") String shortName,
                     @Param("engName") String engName,
                     @Param("listedDate") LocalDate listedDate,
                     @Param("market") String market,
                     @Param("secType") String secType,
                     @Param("sector") String sector,
                     @Param("stockType") String stockType,
                     @Param("parValue") Integer parValue,
                     @Param("listedShares") Long listedShares);



}
