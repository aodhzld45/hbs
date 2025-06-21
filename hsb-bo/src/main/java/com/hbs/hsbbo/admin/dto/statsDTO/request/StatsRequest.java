package com.hbs.hsbbo.admin.dto.statsDTO.request;


import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;


// 요청 DTO - 통계 조회 기간 받기
public record StatsRequest(
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        LocalDateTime startDate,

        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
        LocalDateTime endDate
) {}


