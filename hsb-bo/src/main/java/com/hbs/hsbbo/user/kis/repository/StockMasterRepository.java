package com.hbs.hsbbo.user.kis.repository;

import com.hbs.hsbbo.user.kis.domain.entity.StockMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface StockMasterRepository extends JpaRepository<StockMaster, Long> {
    Optional<StockMaster> findByIsin(String isin);
    Optional<StockMaster> findBySymbol(String symbol);

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
