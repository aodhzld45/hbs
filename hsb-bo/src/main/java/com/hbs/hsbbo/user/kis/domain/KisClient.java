package com.hbs.hsbbo.user.kis.domain;

import com.hbs.hsbbo.user.kis.dto.StockSearchDto;
import com.hbs.hsbbo.user.kis.service.KisAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

@Slf4j
@Component
@RequiredArgsConstructor
public class KisClient {
    @Qualifier("kisWebClient")   //  반드시 baseUrl(domain) 걸린 Bean 주입
    private final WebClient webClient;
    private final KisAuthService auth;

    //@Value("${kis.domain}")     private String domain;
    @Value("${kis.app-key}")    private String appKey;
    @Value("${kis.app-secret}") private String appSecret;

    private Map<String,String> headers(String trId){
        return Map.of(
                "authorization", "Bearer " + auth.getAccessToken(),
                "appkey", appKey,
                "appsecret", appSecret,
                "tr_id", trId
        );
    }

    private <T> T callWithRefresh(Supplier<T> call){
        try { return call.get(); }
        catch (WebClientResponseException e){
            log.error("[KIS] call error {} {} body={}", e.getRawStatusCode(), e.getStatusText(), e.getResponseBodyAsString());
            if (e.getRawStatusCode() == 401){
                log.warn("[KIS] 401 -> force token refresh & retry");
                auth.forceRefresh();
                return call.get();
            }
            throw e;
        }
    }

    /** 현재가 조회 */
    public Map<String,Object> inquirePrice(String code){
        final String path = "/uapi/domestic-stock/v1/quotations/inquire-price";  //  상대경로만
        log.debug("[KIS] GET {}", path);
        return callWithRefresh(() ->
                webClient.get()
                        .uri(b -> b.path(path)
                                .queryParam("FID_COND_MRKT_DIV_CODE","J")
                                .queryParam("FID_INPUT_ISCD", code)
                                .build())
                        .headers(h -> headers("FHKST01010100").forEach(h::add))
                        .accept(MediaType.APPLICATION_JSON)
                        .retrieve()
                        .bodyToMono(Map.class)
                        .block()
        );
    }

    /** 일별 시세 조회 */
    public Map<String,Object> inquireDaily(String code, String period){
        final String path = "/uapi/domestic-stock/v1/quotations/inquire-daily-price"; // 상대경로만
        log.debug("[KIS] GET {}", path);
        return callWithRefresh(() ->
                webClient.get()
                        .uri(b -> b.path(path)
                                .queryParam("FID_COND_MRKT_DIV_CODE","J")
                                .queryParam("FID_INPUT_ISCD", code)
                                .queryParam("FID_PERIOD_DIV_CODE", period)
                                .queryParam("FID_ORG_ADJ_PRC","0")
                                .build())
                        .headers(h -> headers("FHKST01010400").forEach(h::add))
                        .accept(MediaType.APPLICATION_JSON)
                        .retrieve()
                        .bodyToMono(Map.class)
                        .block()
        );
    }

    public List<StockSearchDto> searchStocks(String keyword) {
        final String path = "/uapi/domestic-stock/v1/quotations/inquire-issuemaster";
        log.debug("[KIS] SEARCH {}", keyword);

        return callWithRefresh(() ->
                webClient.get()
                        .uri(b -> b.path(path)
                                .queryParam("FID_COND_MRKT_DIV_CODE","J")  // 주식시장
                                .queryParam("FID_INPUT_ISCD", keyword)    // 종목코드 or 이름 키워드
                                .queryParam("FID_DIV_CLS_CODE","0")
                                .queryParam("FID_BLNG_CLS_CODE","0")
                                .queryParam("FID_TRGT_CLS_CODE","111111111")
                                .queryParam("FID_TRGT_EXLS_CLS_CODE","000000")
                                .build())
                        .headers(h -> headers("FHKST01010100").forEach(h::add))
                        .accept(MediaType.APPLICATION_JSON)
                        .retrieve()
                        .bodyToMono(Map.class)
                        .map(resp -> {
                            Object out = resp.get("output");
                            if (out instanceof List<?> list) {
                                return list.stream()
                                        .filter(Map.class::isInstance)
                                        .map(m -> (Map<String,Object>) m)
                                        .map(m -> new StockSearchDto(
                                                (String) m.get("stck_shrn_iscd"),  // 종목코드
                                                (String) m.get("hts_kor_isnm")     // 종목명
                                        ))
                                        .toList();
                            }
                            return List.<StockSearchDto>of();
                        })
                        .block()
        );
    }

}
