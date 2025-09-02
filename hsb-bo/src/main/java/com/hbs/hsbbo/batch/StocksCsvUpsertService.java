package com.hbs.hsbbo.batch;

import com.opencsv.CSVReader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class StocksCsvUpsertService {

    private final JdbcTemplate jdbc;

    public static record Result(int inserted, int updated, int skipped) {}

    /** CSV 바이트(MS949 가능) → stocks 업서트 */
    public Result upsert(byte[] csvBytes, Charset charset) {
        int ins = 0, upd = 0, skip = 0;

        try (var reader = new CSVReader(new InputStreamReader(new ByteArrayInputStream(csvBytes), charset))) {
            String[] header = reader.readNext();
            if (header == null) return new Result(0,0,0);
            var idx = index(header);

            final String sql = """
                INSERT INTO stocks (symbol, name, market, use_tf, del_tf)
                VALUES (?, ?, ?, 'Y', 'N')
                ON DUPLICATE KEY UPDATE
                  name = VALUES(name),
                  market = VALUES(market),
                  up_date = NOW(),
                  del_tf = 'N'
                """;

            List<Object[]> batch = new ArrayList<>(1000);
            String[] row;
            while ((row = reader.readNext()) != null) {
                String rawCode = pick(row, idx,
                        "단축코드", "종목코드", "종목번호", "표준코드");   // 단축코드 열
                String nameKr  = pick(row, idx,
                        "한글 종목명", "종목명", "한글명");             // 이름 열
                String market  = pick(row, idx,
                        "시장구분", "시장", "market");                 // 마켓 열

                String symbol = normalizeCode(rawCode);
                if (symbol == null || nameKr == null || nameKr.isBlank()) { skip++; continue; }

                batch.add(new Object[]{ symbol, nameKr.trim(), normalizeMarket(market) });

                if (batch.size() >= 1000) {
                    int[] r = jdbc.batchUpdate(sql, batch);
                    ins += count(r, 1); upd += count(r, 2); batch.clear();
                }
            }
            if (!batch.isEmpty()) {
                int[] r = jdbc.batchUpdate(sql, batch);
                ins += count(r, 1); upd += count(r, 2);
            }
            return new Result(ins, upd, skip);
        } catch (Exception e) {
            throw new IllegalStateException("stocks 업서트 실패", e);
        }
    }

    /* ---------- helpers ---------- */

    private Map<String,Integer> index(String[] header){
        Map<String,Integer> map = new HashMap<>();
        for (int i=0;i<header.length;i++) map.put(header[i].trim(), i);
        return map;
    }
    private String pick(String[] row, Map<String,Integer> idx, String... keys){
        for (String k: keys) { Integer i = idx.get(k); if (i!=null && i<row.length) return row[i]; }
        return null;
    }

    /** CSV 코드(3~5자리 등) → OpenAPI용 6자리로 zero-pad */
    private String normalizeCode(String raw){
        if (raw == null) return null;
        String digits = raw.replaceAll("\\D", "");
        if (digits.isEmpty()) return null;
        return String.format("%06d", Integer.parseInt(digits));
    }

    private String normalizeMarket(String raw){
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

    /** MySQL batch 결과: insert=1, update=2가 일반적 */
    private int count(int[] arr, int target){
        int c=0; for (int v: arr) if (v==target) c++; return c;
    }
}
