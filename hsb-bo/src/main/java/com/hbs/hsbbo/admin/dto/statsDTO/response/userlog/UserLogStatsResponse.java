package com.hbs.hsbbo.admin.dto.statsDTO.response.userlog;

import java.util.List;

public record UserLogStatsResponse(
        List<UserLogHourStatsResponse> hourStats
) {}
