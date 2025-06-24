package com.hbs.hsbbo.admin.service;

import com.hbs.hsbbo.admin.dto.statsDTO.response.comment.CommentStatsResponse;
import com.hbs.hsbbo.admin.dto.statsDTO.response.comment.CommentTargetResponse;
import com.hbs.hsbbo.admin.dto.statsDTO.response.content.ContentMonthStatResponse;
import com.hbs.hsbbo.admin.dto.statsDTO.response.content.ContentPopularResponse;
import com.hbs.hsbbo.admin.dto.statsDTO.response.content.ContentStatsResponse;
import com.hbs.hsbbo.admin.dto.statsDTO.response.content.ContentTypeRatioResponse;
import com.hbs.hsbbo.admin.dto.statsDTO.response.userlog.UserLogHourStatsResponse;
import com.hbs.hsbbo.admin.dto.statsDTO.response.userlog.UserLogStatsResponse;
import com.hbs.hsbbo.admin.repository.stats.StatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final StatsRepository statsRepository;

    // 콘텐츠 통계 조회 후 DTO 변환
    public ContentStatsResponse getContentStats(LocalDateTime start, LocalDateTime end) {
        var monthly = statsRepository.countContentMonthly(start, end).stream()
                .map(r -> new ContentMonthStatResponse((String) r[0], ((Long) r[1]).intValue()))
                .toList();

        var ratios = statsRepository.countContentTypeRatio(start, end).stream()
                .map(r -> new ContentTypeRatioResponse((String) r[0], ((Long) r[1]).intValue()))
                .toList();

        var popular = statsRepository.contentPopular(start, end).stream()
                .map(r -> new ContentPopularResponse(
                        (String) r[0],
                        ((Number) r[1]).intValue()
                ))
                .toList();

        return new ContentStatsResponse(monthly, ratios, popular);
    }

    // 댓글 통계 조회 후 DTO 변환
    public CommentStatsResponse getCommentStats(LocalDateTime start, LocalDateTime end) {
        var commentTarget = statsRepository.commentTarget(start, end).stream()
                .map(r -> new CommentTargetResponse(
                        (String) r[0],
                        ((Number) r[1]).intValue()
                ))
                .toList();

        return new CommentStatsResponse(commentTarget);
    }

    // 시간대별 방문자 수 (SID 중복 제외)
    public UserLogStatsResponse getUserLogStats() {
        var userLogHour = statsRepository.userLogHour().stream()
                .map(r-> new UserLogHourStatsResponse(
                        (String) r[0],
                        ((Number) r[1]).intValue()
                ))
                .toList();

        return new UserLogStatsResponse(userLogHour);
    }




}
