package com.hbs.hsbbo.batch;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
public class KrxSymbolClient {

    // 엔드포인트
    private static final String GET_JSON = "/comm/bldAttendant/getJsonData.cmd";
    private static final String OTP_PATH = "/comm/fileDn/GenerateOTP/generate.cmd";
    private static final String DL_XLS   = "/comm/fileDn/download_excel/download.cmd";
    private static final String DL_CSV   = "/comm/fileDn/download_csv/download.cmd";
    private static final MediaType FORM  = MediaType.parseMediaType("application/x-www-form-urlencoded; charset=UTF-8");

    // WebClient (64MB 버퍼 + 공통 헤더)
    private final WebClient web = WebClient.builder()
            .baseUrl("https://data.krx.co.kr")
            .codecs(c -> c.defaultCodecs().maxInMemorySize(64 * 1024 * 1024))
            .defaultHeaders(h -> {
                h.set(HttpHeaders.USER_AGENT, "Mozilla/5.0");
                h.set(HttpHeaders.ACCEPT, "*/*");
                h.set("X-Requested-With", "XMLHttpRequest");
                h.set(HttpHeaders.ORIGIN, "https://data.krx.co.kr");
            })
            .build();

    @Value("${krx.symbols.referer}")    String referer;     // ex) https://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201020201
    @Value("${krx.symbols.otp-params}") String otpParams;   // ex) locale=ko_KR&mktId=ALL&share=1&csvxls_isNo=false&name=fileDown&url=dbms/MDC/STAT/standard/MDCSTAT01901

    /** 전종목 기본정보 파일(XLS 우선, 실패 시 CSV) */
    public byte[] downloadXls() {
        warmup();                                        // 0) 세션 준비
        callGetJsonData(toFormForData(otpParams));       // 1) 조회 → 결과셋 세션 적재

        // 2) OTP
        String otp = web.post().uri(OTP_PATH)
                .header(HttpHeaders.REFERER, referer)
                .contentType(FORM)
                .body(BodyInserters.fromFormData(toForm(otpParams)))
                .retrieve()
                .bodyToMono(String.class)
                .blockOptional()
                .filter(s -> !s.isBlank())
                .orElseThrow(() -> new IllegalStateException("KRX OTP empty"));

        // 3) 다운로드: XLS → CSV 폴백
        byte[] bytes = download(DL_XLS, otp, "xls");
        if (bytes.length > 0 && isExcel(bytes)) return bytes;

        bytes = download(DL_CSV, otp, "csv");
        if (bytes.length == 0) throw new IllegalStateException("KRX download empty after XLS/CSV");
        return bytes;
    }

    private void warmup() {
        web.get().uri(referer)
                .header(HttpHeaders.REFERER, referer)
                .retrieve()
                .toBodilessEntity()
                .onErrorResume(e -> Mono.empty())
                .block();
    }

    private void callGetJsonData(MultiValueMap<String,String> form) {
        web.post().uri(GET_JSON)
                .header(HttpHeaders.REFERER, referer)
                .contentType(FORM)
                .body(BodyInserters.fromFormData(form))
                .retrieve()
                .bodyToMono(String.class)
                .onErrorResume(e -> Mono.empty())
                .block();
    }

    private byte[] download(String path, String otp, String tag) {
        ResponseEntity<byte[]> res = web.post().uri(path)
                .header(HttpHeaders.REFERER, referer)
                .contentType(FORM)
                .body(BodyInserters.fromFormData("code", otp))
                .retrieve()
                .toEntity(byte[].class)
                .onErrorResume(e -> Mono.just(ResponseEntity.status(599).body(new byte[0])))
                .block();

        if (res == null || res.getBody() == null) return new byte[0];
        String ct = res.getHeaders().getFirst(HttpHeaders.CONTENT_TYPE);
        byte[] body = res.getBody();

        // 오류 페이지 방지
        if (ct != null && ct.startsWith("text/html")) {
            dumpHtml(tag, body);
            return new byte[0];
        }
        return body;
    }

    // ---- helpers ------------------------------------------------------------

    /** "a=1&b=2" → FormData */
    private static MultiValueMap<String,String> toForm(String query) {
        LinkedMultiValueMap<String,String> form = new LinkedMultiValueMap<>();
        if (query == null || query.isBlank()) return form;
        for (String p : query.split("&")) {
            int i = p.indexOf('=');
            String k = i >= 0 ? p.substring(0, i) : p;
            String v = i >= 0 ? p.substring(i + 1) : "";
            form.add(java.net.URLDecoder.decode(k, StandardCharsets.UTF_8),
                    java.net.URLDecoder.decode(v, StandardCharsets.UTF_8));
        }
        return form;
    }

    /** getJsonData용: url → bld */
    private static MultiValueMap<String,String> toFormForData(String otpQuery) {
        MultiValueMap<String,String> src = toForm(otpQuery);
        LinkedMultiValueMap<String,String> dst = new LinkedMultiValueMap<>();
        src.forEach((k, vs) -> vs.forEach(v -> dst.add("url".equals(k) ? "bld" : k, v)));
        return dst;
    }

    private static boolean isExcel(byte[] b) {
        if (b == null || b.length < 2) return false;
        if (b[0] == 'P' && b[1] == 'K') return true; // xlsx(zip)
        return b.length > 7 && (b[0] & 0xFF) == 0xD0 && (b[1] & 0xFF) == 0xCF
                && (b[2] & 0xFF) == 0x11 && (b[3] & 0xFF) == 0xE0; // xls(ole)
    }

    private static void dumpHtml(String tag, byte[] html) {
        try {
            var dir = java.nio.file.Path.of("krx-dumps");
            java.nio.file.Files.createDirectories(dir);
            var p = dir.resolve("err_" + tag + "_" + System.currentTimeMillis() + ".html");
            java.nio.file.Files.write(p, html);
            log.warn("[KRX] {} HTML dump -> {}", tag, p.toAbsolutePath());
        } catch (Exception ignore) {}
    }
}
