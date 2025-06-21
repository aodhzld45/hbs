package com.hbs.hsbbo.admin.dto.statsDTO.response.content;

import java.util.List;

public record ContentStatsResponse(
        List<ContentMonthStatResponse> monthlyStats,
        List<ContentTypeRatioResponse> ContentTypeRatios
) {}
