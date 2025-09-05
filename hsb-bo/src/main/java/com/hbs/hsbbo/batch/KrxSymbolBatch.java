package com.hbs.hsbbo.batch;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.File;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class KrxSymbolBatch {
    private static final int MAX_RETRY = 3;

    private final KrxSymbolClient client;
    private final XlsToCsv converter;

    private final StocksCsvUpsertService upsertService;
    private final StockMasterCsvUpsertService stockMasterUpsertService;
    private final StockMasterJdbcUpsertService stockMasterJdbcUpsertService;

    @Value("${krx.symbols.out-path}")    String outPath;
    @Value("${krx.symbols.otp-params}")  String otpParams; // ← YAML의 쿼리 스트링

    @Scheduled(cron = "${krx.symbols.cron}")
    public void run() {
        log.info("[KrxSymbolBatch] start");
        try {
            Map<String,String> params = parseQuery(otpParams);
            byte[] xlsPayload = retryDownload(params);

            File out = new File(outPath);
            if (out.getParentFile() != null) out.getParentFile().mkdirs();
            log.info("[KrxSymbolBatch] xls length = {}", xlsPayload.length);
            converter.convert(xlsPayload, out);               // XLS -> CSV 파일 저장
            log.info("[KrxSymbolBatch] wrote {}", out.getAbsolutePath());

            // CSV 파일을 읽어 stocks 테이블 업서트
            byte[] csv = Files.readAllBytes(out.toPath());
            //var res = upsertService.upsert(csv, java.nio.charset.Charset.forName("MS949")); // 필요 시 UTF-8로 변경 테스트
            // --- 1) stocks 테이블 업서트 ---
/*            var res1 = upsertService.upsert(csv, StandardCharsets.UTF_8);
            log.info("[stocks upsert] inserted={}, updated={}, skipped={}",
                    res1.inserted(), res1.updated(), res1.skipped());*/

            // --- 2) stock_master 테이블 업서트 Spring Data JPA Entity 기반 Upsert 방식 ---
            // ================================================================
            // [JPA 방식] Entity + Repository 기반 Upsert
            // - saveAll() 사용
            // - 객체지향적 / 영속성 컨텍스트 관리 가능
            // - 대량 처리 시 Hibernate SQL 로그 많음
            // ================================================================
/*            var res2 = stockMasterUpsertService.upsert(csv, StandardCharsets.UTF_8);
            log.info("[stock_master Entity + Repository upsert] inserted={}, updated={}, skipped={}",
                    res2.inserted(), res2.updated(), res2.skipped());*/

            // --- 3) stock_master 테이블 업서트 JDBC Batch Insert/Update Skeleton 방식  ---
            // ================================================================
            // [JDBC Batch 방식] JdbcTemplate + ON DUPLICATE KEY UPDATE
            // - MySQL 전용 UPSERT 문법
            // - 성능 최적화, 로그 최소화
            // - 엔티티 기능 없음 (순수 SQL)
            // ================================================================
            var res3 = stockMasterJdbcUpsertService.upsert(csv, StandardCharsets.UTF_8);
            log.info("[stock_master JdbcTemplate + ON DUPLICATE KEY UPDATE upsert] inserted={}, updated={}, skipped={}",
                    res3.inserted(), res3.updated(), res3.skipped());

        } catch (Exception e) {
            log.error("[KrxSymbolBatch] failed: {}", e.toString(), e);
        }
    }

    /** 지수 백오프 재시도 래퍼 */
    private byte[] retryDownload(Map<String,String> params) throws Exception {
        long backoffMs = 1_000L;
        Exception last = null;
        for (int i = 1; i <= MAX_RETRY; i++) {
            try {
                log.info("[KrxSymbolBatch] try {} / {} ({}", i, MAX_RETRY, params.get("url"));
                return client.downloadXls();
            } catch (Exception e) {
                last = e;
                log.warn("[KrxSymbolBatch] attempt {} failed: {}", i, e.toString());
                if (i < MAX_RETRY) {
                    try { TimeUnit.MILLISECONDS.sleep(backoffMs); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
                    backoffMs *= 2;
                }
            }
        }
        throw last != null ? last : new IllegalStateException("KRX download failed without exception");
    }

    /** "a=1&b=2&c=x%2Fy" → Map */
    private Map<String,String> parseQuery(String q) {
        Map<String,String> map = new LinkedHashMap<>();
        if (q == null || q.isBlank()) return map;
        for (String pair : q.split("&")) {
            int idx = pair.indexOf('=');
            String k = idx >= 0 ? pair.substring(0, idx) : pair;
            String v = idx >= 0 ? pair.substring(idx + 1) : "";
            map.put(
                    URLDecoder.decode(k, StandardCharsets.UTF_8),
                    URLDecoder.decode(v, StandardCharsets.UTF_8)
            );
        }
        return map;
    }
}
