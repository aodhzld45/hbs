package com.hbs.hsbbo.admin.ai.usage.service;

import com.hbs.hsbbo.admin.ai.usage.domain.type.Period;
import com.hbs.hsbbo.admin.ai.usage.dto.UsageStatsProjection;
import com.hbs.hsbbo.admin.ai.usage.dto.request.UsageStatsRequest;
import com.hbs.hsbbo.admin.ai.usage.dto.response.UsageStatsItem;
import com.hbs.hsbbo.admin.ai.usage.dto.response.UsageStatsListResponse;
import com.hbs.hsbbo.admin.ai.usage.repository.UsageStatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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

        // 2) 단일 쿼리 호출 (enum.name() 으로 넘김)
        List<UsageStatsProjection> rows = usageStatsRepository.findStats(
                req.getTenantId(),
                periodEnum.name(),        // 'DAILY' / 'WEEKLY' / 'MONTHLY'
                from,
                to,
                req.getSiteKeyId(),
                req.getChannel()
        );

        // 3) 자바 레벨 페이징
        int page = Math.max(req.getPage(), 0);
        int size = req.getSize() > 0 ? req.getSize() : 20;

        int totalCount = rows.size();
        int totalPages = (int) Math.ceil((double) totalCount / size);

        int fromIndex = page * size;
        if (fromIndex >= totalCount) {
            return UsageStatsListResponse.of(List.of(), totalCount, totalPages);
        }
        int toIndex = Math.min(fromIndex + size, totalCount);

        List<UsageStatsItem> items = rows.subList(fromIndex, toIndex).stream()
                .map(p -> toItem(p, periodEnum))
                .toList();

        return UsageStatsListResponse.of(items, totalCount, totalPages);
    }

    private UsageStatsItem toItem(UsageStatsProjection p, Period period) {
        LocalDate start = p.getBucketDate();
        LocalDate end;

        switch (period) {
            case WEEKLY  -> end = start.plusDays(6); // 월~일
            case MONTHLY -> end = start.withDayOfMonth(start.lengthOfMonth());
            case DAILY   -> end = start;
            default      -> throw new IllegalArgumentException("지원되지 않는 기간 조회입니다: " +  period);
        }

        return UsageStatsItem.builder()
                .bucketLabel(p.getBucketLabel())
                .startDate(start)
                .endDate(end)
                .totalCalls(nz(p.getTotalCalls()))
                .successCalls(nz(p.getSuccessCalls()))
                .failCalls(nz(p.getFailCalls()))
                .totalPromptTokens(nz(p.getTotalPromptTokens()))
                .totalCompletionTokens(nz(p.getTotalCompletionTokens()))
                .totalTokens(nz(p.getTotalTokens()))
                .avgLatencyMs(p.getAvgLatencyMs() == null ? 0.0 : p.getAvgLatencyMs())
                .build();
    }

    private Long nz(Long v) {
        return v == null ? 0L : v;
    }

}
