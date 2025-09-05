package com.hbs.hsbbo.batch;

import com.hbs.hsbbo.user.kis.domain.entity.StockMaster;
import com.hbs.hsbbo.user.kis.repository.StockMasterRepository;
import com.opencsv.CSVReader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.time.LocalDate;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockMasterCsvUpsertService {

    private final StockMasterRepository repo;
    private static final int CHUNK = 1000;

    public record Result(int inserted, int updated, int skipped) {}

    /**
     * CSV 바이트(MS949/UTF-8 등) → StockMaster 업서트.
     * - 헤더명을 유연하게 대응(단축코드/종목코드/종목번호, 한글 종목명/약명 등)
     * - ISIN 우선, 없으면 SYMBOL로 기존 레코드 매칭
     * - 신규는 useTf=Y, delTf=N 기본값 세팅
     * - 갱신은 delTf=N 로 복구
     */

    @Transactional
    public Result upsert(byte[] csvBytes, Charset cs) {
        int ins = 0, upd = 0, skip = 0;

        try (var reader = new CSVReader(new InputStreamReader(new ByteArrayInputStream(csvBytes), cs))) {
            String[] header = reader.readNext();
            if (header == null) {
                log.warn("빈 CSV입니다. (header 없음)");
                return new Result(0, 0, 0);
            }
            var idx = index(header);

            List<String[]> buf = new ArrayList<>(CHUNK);
            String[] row;
            while ((row = reader.readNext()) != null) {
                // 공백 라인/완전무효 라인 스킵
                if (row.length == 0 || (row.length == 1 && (row[0] == null || row[0].isBlank()))) {
                    continue;
                }
                buf.add(row);
                if (buf.size() >= CHUNK) {
                    Part r = upsertChunk(buf, idx);
                    ins += r.ins; upd += r.upd; skip += r.skip;
                    buf.clear();
                }
            }
            if (!buf.isEmpty()) {
                Part r = upsertChunk(buf, idx);
                ins += r.ins; upd += r.upd; skip += r.skip;
            }
        } catch (Exception e) {
            log.error("StockMaster 업서트 실패", e);
            throw new IllegalStateException("StockMaster 업서트 실패", e);
        }

        log.info("StockMaster 업서트 완료: inserted={}, updated={}, skipped={}", ins, upd, skip);
        return new Result(ins, upd, skip);
    }

    private static record Part(int ins, int upd, int skip) {}

    /** 같은 트랜잭션 내에서 CHUNK 단위 처리 (행별 DB 재조회 제거 버전) */
    protected Part upsertChunk(List<String[]> rows, Map<String, Integer> idx) {
        // 1) 키 수집
        Set<String> isins = new HashSet<>();
        Set<String> symbols = new HashSet<>();
        for (var r : rows) {
            var isin = pick(r, idx, "표준코드", "ISIN", "isin");
            var code = normalizeCode(pick(r, idx, "단축코드", "종목코드", "종목번호", "symbol", "코드"));
            if (isin != null && !isin.isBlank()) isins.add(isin.trim());
            if (code != null) symbols.add(code);
        }

        // 2) 기존 엔티티 벌크 로드 → Map (DB 조회 2번)
        Map<String, StockMaster> byIsin = isins.isEmpty() ? Map.of()
                : repo.findAllByIsinIn(isins).stream()
                .collect(Collectors.toMap(StockMaster::getIsin, Function.identity(), (a,b)->a));
        Map<String, StockMaster> bySymbol = symbols.isEmpty() ? Map.of()
                : repo.findAllBySymbolIn(symbols).stream()
                .filter(e -> e.getIsin()==null || !byIsin.containsKey(e.getIsin()))
                .collect(Collectors.toMap(StockMaster::getSymbol, Function.identity(), (a,b)->a));

        // 3) 이번 CHUNK에서 새로 만드는 엔티티 캐시(중복 INSERT 방지)
        Map<String, StockMaster> newByIsin = new HashMap<>();
        Map<String, StockMaster> newBySymbol = new HashMap<>();

        // 저장 목록(중복 제거)
        Map<Long, StockMaster> toUpdate = new LinkedHashMap<>(); // id 가진 기존 엔티티
        List<StockMaster> toInsert = new ArrayList<>();          // 신규 엔티티

        int ins = 0, upd = 0, skip = 0;

        for (var r : rows) {
            try {
                String isin       = trim(pick(r, idx, "표준코드", "ISIN", "isin"));
                String symbol     = normalizeCode(pick(r, idx, "단축코드", "종목코드", "종목번호", "symbol", "코드"));
                String name       = trim(pick(r, idx, "한글 종목명", "종목명", "name", "한글명"));
                String shortName  = trim(pick(r, idx, "한글 종목약명", "종목약명", "한글약명", "shortName"));
                String engName    = trim(pick(r, idx, "영문 종목명", "영문명", "engName"));
                LocalDate listed  = toDate(pick(r, idx, "상장일", "listedDate"));
                String market     = normalizeMarket(pick(r, idx, "시장구분", "시장", "market"));
                String secType    = trim(pick(r, idx, "증권구분", "securityType"));
                String sector     = trim(pick(r, idx, "소속부", "sector"));
                String stockType  = trim(pick(r, idx, "주식종류", "stockType"));
                Integer parValue  = toInt(pick(r, idx, "액면가", "parValue"));
                Long shares       = toLong(pick(r, idx, "상장주식수", "listedShares"));

                if (symbol == null || isin == null || name == null || name.isBlank()) {
                    skip++; continue;
                }

                // ① 기존 로드에서 찾기
                StockMaster e = byIsin.get(isin);
                if (e == null) e = bySymbol.get(symbol);

                // ② 이번 CHUNK 신규 캐시에서 찾기 (중복 insert 방지)
                if (e == null) e = newByIsin.get(isin);
                if (e == null) e = newBySymbol.get(symbol);

                // ③ 그래도 없으면 신규 생성(메모리 캐시에 등록)
                boolean isNew = false;
                if (e == null) {
                    e = StockMaster.builder()
                            .isin(isin)
                            .symbol(symbol)
                            .name(name)
                            .shortName(shortName)
                            .engName(engName)
                            .listedDate(listed)
                            .market(market)
                            .secType(secType)
                            .sector(sector)
                            .stockType(stockType)
                            .parValue(parValue)
                            .listedShares(shares)
                            .build();
                    newByIsin.put(isin, e);
                    newBySymbol.put(symbol, e);
                    toInsert.add(e);
                    ins++;
                    isNew = true;
                }

                // ④ 공통 갱신(신규/기존 모두 동일)
                if (!isNew) {
                    e.setSymbol(symbol);
                    e.setName(name);
                    e.setShortName(shortName);
                    e.setEngName(engName);
                    e.setListedDate(listed);
                    e.setMarket(market);
                    e.setSecType(secType);
                    e.setSector(sector);
                    e.setStockType(stockType);
                    e.setParValue(parValue);
                    e.setListedShares(shares);
                    e.setDelTf("N");
                    if (e.getId() != null) toUpdate.put(e.getId(), e);
                    else if (!toInsert.contains(e)) toInsert.add(e);
                    upd++;
                }
            } catch (Exception ex) {
                skip++;
                if (log.isDebugEnabled()) log.debug("행 처리 실패(스킵): {}", Arrays.toString(r), ex);
            }
        }

        // 4) 저장 (배치)
        if (!toInsert.isEmpty()) repo.saveAll(toInsert);
        if (!toUpdate.isEmpty()) repo.saveAll(toUpdate.values());

        return new Part(ins, upd, skip);
    }

    /* ---------------- helpers ---------------- */
    private static Map<String, Integer> index(String[] header) {
        Map<String, Integer> map = new HashMap<>();
        for (int i = 0; i < header.length; i++) {
            if (header[i] == null) continue;
            map.put(header[i].trim(), i);
        }
        return map;
    }

    private static String pick(String[] row, Map<String, Integer> idx, String... keys) {
        for (String k : keys) {
            Integer i = idx.get(k);
            if (i != null && i < row.length) return row[i];
        }
        return null;
    }

    private static String trim(String s) { return s == null ? null : s.trim(); }

    /** CSV 코드(3~5자리 등) → 6자리 zero-pad, 6자리 넘치면 앞 6자리 */
    private static String normalizeCode(String raw) {
        if (raw == null) return null;
        String digits = raw.replaceAll("\\D", "");
        if (digits.isEmpty()) return null;
        if (digits.length() >= 6) return digits.substring(0, 6);
        return String.format("%06d", Integer.parseInt(digits));
    }

    private static String normalizeMarket(String raw) {
        if (raw == null) return "KOSPI";
        String r = raw.trim().toUpperCase();
        if (r.contains("KOSDAQ") || r.contains("코스닥")) return "KOSDAQ";
        if (r.contains("KOSPI") || r.contains("유가증권") || r.contains("코스피")) return "KOSPI";
        if (r.contains("KONEX") || r.contains("코넥스")) return "KONEX";
        if (r.contains("ETF")) return "ETF";
        if (r.contains("ETN")) return "ETN";
        if (r.contains("REIT")) return "REITs";
        return r.isBlank() ? "KOSPI" : r;
    }

    private static LocalDate toDate(String ymd) {
        if (ymd == null) return null;
        String s = ymd.replaceAll("[^0-9]", "");
        if (s.length() != 8) return null;
        return LocalDate.of(
                Integer.parseInt(s.substring(0, 4)),
                Integer.parseInt(s.substring(4, 6)),
                Integer.parseInt(s.substring(6, 8))
        );
    }

    private static Integer toInt(String s) {
        try {
            return s == null ? null : Integer.valueOf(s.replace(",", "").trim());
        } catch (Exception e) { return null; }
    }

    private static Long toLong(String s) {
        try {
            return s == null ? null : Long.valueOf(s.replace(",", "").trim());
        } catch (Exception e) { return null; }
    }

}
