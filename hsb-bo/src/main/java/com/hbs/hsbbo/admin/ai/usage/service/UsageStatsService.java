package com.hbs.hsbbo.admin.ai.usage.service;

import com.hbs.hsbbo.admin.ai.usage.domain.type.Period;
import com.hbs.hsbbo.admin.ai.usage.dto.UsageStatsProjection;
import com.hbs.hsbbo.admin.ai.usage.dto.request.UsageStatsRequest;
import com.hbs.hsbbo.admin.ai.usage.dto.response.UsageStatsItem;
import com.hbs.hsbbo.admin.ai.usage.dto.response.UsageStatsListResponse;
import com.hbs.hsbbo.admin.ai.usage.repository.UsageStatsRepository;
import com.hbs.hsbbo.common.util.ExcelUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UsageStatsService {
    private final UsageStatsRepository usageStatsRepository;

    public UsageStatsListResponse getUsageStats(UsageStatsRequest req) {
        // 1) 날짜 기본값 처리
        LocalDate fromDate = req.getFromDate();
        LocalDate toDate   = req.getToDate();

        if (fromDate == null || toDate == null) {
            toDate = LocalDate.now();
            fromDate = toDate.minusDays(6); // 기본: 최근 7일
        }

        LocalDateTime from = fromDate.atStartOfDay();
        LocalDateTime to   = toDate.plusDays(1).atStartOfDay(); // [from, to)

        Period periodEnum =
                (req.getPeriod() != null ? req.getPeriod() : Period.DAILY);

        // 2) Pageable
        int page = Math.max(req.getPage(), 0);
        int size = req.getSize() > 0 ? req.getSize() : 20;
        Pageable pageable = PageRequest.of(page, size);

        // 3) DB 페이징 쿼리 호출
        Page<UsageStatsProjection> result = usageStatsRepository.findStatsPaged(
                req.getTenantId(),
                periodEnum.name(),
                from,
                to,
                req.getSiteKeyId(),
                req.getChannel(),
                pageable
        );

        // 4) Projection → Item 변환
        List<UsageStatsItem> items = result.getContent().stream()
                .map(p -> UsageStatsItem.from(p, periodEnum))
                .toList();
        return  UsageStatsListResponse.of(
                items,
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    // 엑셀 다운로드
    public byte[] exportUsageStatsExcel(UsageStatsRequest req) {
        // 1) getUsageStats(req) 재사용해도 되고, DB조회만 별도로 해도 됨
        UsageStatsListResponse res = getUsageStats(req);
        List<UsageStatsItem> items = res.getItems();

        List<String> headers = List.of(
                "버킷 라벨",
                "시작일",
                "종료일",
                "총 호출",
                "성공",
                "실패",
                "성공률(%)",
                "입력 토큰",
                "출력 토큰",
                "총 토큰",
                "평균 응답(ms)",
                "호출당 평균 토큰"
        );


        InputStream is = ExcelUtil.generateExcel(
                "AI 사용 통계(" + (req.getPeriod() == null ? "DAILY" : req.getPeriod().name()) + ")",
                items,
                headers,
                List.of(
                        it -> safe(it.getBucketLabel()),
                        it -> safe(it.getStartDate()),
                        it -> safe(it.getEndDate()),
                        it -> String.valueOf(nvl(it.getTotalCalls())),
                        it -> String.valueOf(nvl(it.getSuccessCalls())),
                        it -> String.valueOf(nvl(it.getFailCalls())),
                        it -> String.valueOf(nvlD(it.getSuccessRate())), // UsageStatsItem에 추가했다면
                        it -> String.valueOf(nvl(it.getTotalPromptTokens())),
                        it -> String.valueOf(nvl(it.getTotalCompletionTokens())),
                        it -> String.valueOf(nvl(it.getTotalTokens())),
                        it -> String.valueOf(nvlD(it.getAvgLatencyMs())),
                        it -> String.valueOf(nvlD(it.getAvgTokensPerCall()))
                )
        );

        try {
            return is.readAllBytes();
        } catch (Exception e) {
            throw new RuntimeException("UsageStats 엑셀 다운로드에 실패하였습니다.", e);
        }
    }

    private static String safe(Object v) { return v == null ? "" : String.valueOf(v); }
    private static long nvl(Long v) { return v == null ? 0L : v; }
    private static double nvlD(Double v) { return v == null ? 0.0 : v; }

}
