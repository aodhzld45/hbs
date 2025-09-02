package com.hbs.hsbbo.batch;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.File;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
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
            byte[] csv = java.nio.file.Files.readAllBytes(out.toPath());
            //var res = upsertService.upsert(csv, java.nio.charset.Charset.forName("MS949")); // 필요 시 UTF-8로 변경 테스트
            var res = upsertService.upsert(csv, java.nio.charset.StandardCharsets.UTF_8);
            log.info("[stocks upsert] inserted={}, updated={}, skipped={}", res.inserted(), res.updated(), res.skipped());
            log.info("[KrxSymbolBatch] wrote {}", out.getAbsolutePath());
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
