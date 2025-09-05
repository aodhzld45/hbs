package com.hbs.hsbbo.batch;

import com.opencsv.CSVReader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockMasterJdbcUpsertService {

    private final JdbcTemplate jdbc;
    private static final int BATCH = 1000;

    public record Result(int inserted, int updated, int skipped) {}

    public Result upsert(byte[] csvBytes, Charset cs) {
        int ins = 0, upd = 0, skip = 0;

        try (var reader = new CSVReader(new InputStreamReader(new ByteArrayInputStream(csvBytes), cs))) {
            String[] header = reader.readNext();
            if (header == null) return new Result(0, 0, 0);
            var idx = index(header);

            final String sql = """
                INSERT INTO stock_master (
                  isin, symbol, name, short_name, eng_name,
                  listed_date, market, sec_type, sector, stock_type,
                  par_value, listed_shares,
                  use_tf, del_tf
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Y','N')
                ON DUPLICATE KEY UPDATE
                  symbol = VALUES(symbol),
                  name = VALUES(name),
                  short_name = VALUES(short_name),
                  eng_name = VALUES(eng_name),
                  listed_date = VALUES(listed_date),
                  market = VALUES(market),
                  sec_type = VALUES(sec_type),
                  sector = VALUES(sector),
                  stock_type = VALUES(stock_type),
                  par_value = VALUES(par_value),
                  listed_shares = VALUES(listed_shares),
                  del_tf = 'N',
                  up_date = NOW()
                """;

            List<Object[]> batch = new ArrayList<>(BATCH);
            String[] row;
            while ((row = reader.readNext()) != null) {
                String isin       = trim(pick(row, idx, "표준코드", "ISIN", "isin"));
                String symbol     = normalizeCode(pick(row, idx, "단축코드","종목코드","종목번호","symbol"));
                String name       = trim(pick(row, idx, "한글 종목명","종목명","name"));
                String shortName  = trim(pick(row, idx, "한글 종목약명","종목약명","shortName"));
                String engName    = trim(pick(row, idx, "영문 종목명","영문명","engName"));
                LocalDate listed  = toDate(pick(row, idx, "상장일","listedDate"));
                String market     = normalizeMarket(pick(row, idx, "시장구분","시장","market"));
                String secType    = trim(pick(row, idx, "증권구분"));
                String sector     = trim(pick(row, idx, "소속부","sector"));
                String stockType  = trim(pick(row, idx, "주식종류","stockType"));
                Integer parValue  = toInt(pick(row, idx, "액면가","parValue"));
                Long shares       = toLong(pick(row, idx, "상장주식수","listedShares"));

                if (isin == null || symbol == null || name == null) { skip++; continue; }

                batch.add(new Object[] {
                        isin, symbol, name, shortName, engName,
                        listed, market, secType, sector, stockType,
                        parValue, shares
                });

                if (batch.size() >= BATCH) {
                    int[] res = jdbc.batchUpdate(sql, batch);
                    ins += count(res, 1);
                    upd += count(res, 2);
                    batch.clear();
                }
            }
            if (!batch.isEmpty()) {
                int[] res = jdbc.batchUpdate(sql, batch);
                ins += count(res, 1);
                upd += count(res, 2);
            }
        } catch (Exception e) {
            throw new IllegalStateException("stock_master 업서트 실패", e);
        }

        return new Result(ins, upd, skip);
    }

    /* ---------- helpers ---------- */

    private static Map<String,Integer> index(String[] header){
        Map<String,Integer> map = new HashMap<>();
        for (int i=0;i<header.length;i++) map.put(header[i].trim(), i);
        return map;
    }
    private static String pick(String[] row, Map<String,Integer> idx, String... keys){
        for (String k: keys) { Integer i = idx.get(k); if (i!=null && i<row.length) return row[i]; }
        return null;
    }
    private static String trim(String s){ return s==null?null:s.trim(); }

    private static String normalizeCode(String raw){
        if (raw == null) return null;
        String digits = raw.replaceAll("\\D","");
        if (digits.isEmpty()) return null;
        if (digits.length() >= 6) return digits.substring(0,6);
        return String.format("%06d", Integer.parseInt(digits));
    }
    private static String normalizeMarket(String raw){
        if (raw == null) return "KOSPI";
        String r = raw.trim().toUpperCase();
        if (r.contains("KOSDAQ")||r.contains("코스닥")) return "KOSDAQ";
        if (r.contains("KOSPI")||r.contains("유가증권")||r.contains("코스피")) return "KOSPI";
        if (r.contains("KONEX")||r.contains("코넥스")) return "KONEX";
        if (r.contains("ETF")) return "ETF";
        if (r.contains("ETN")) return "ETN";
        if (r.contains("REIT")) return "REITs";
        return r.isBlank() ? "KOSPI" : r;
    }
    private static LocalDate toDate(String ymd){
        if (ymd==null) return null;
        String s = ymd.replaceAll("[^0-9]","");
        if (s.length()!=8) return null;
        return LocalDate.of(
                Integer.parseInt(s.substring(0,4)),
                Integer.parseInt(s.substring(4,6)),
                Integer.parseInt(s.substring(6,8))
        );
    }
    private static Integer toInt(String s){ try { return s==null?null:Integer.valueOf(s.replace(",","")); } catch(Exception e){ return null; } }
    private static Long toLong(String s){ try { return s==null?null:Long.valueOf(s.replace(",","")); } catch(Exception e){ return null; } }

    /** MySQL batch 결과: insert=1, update=2 */
    private static int count(int[] arr, int target){
        int c=0; for (int v: arr) if (v==target) c++; return c;
    }
}
