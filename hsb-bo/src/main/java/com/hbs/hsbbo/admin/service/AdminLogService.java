package com.hbs.hsbbo.admin.service;

import com.hbs.hsbbo.admin.domain.entity.AdminLog;
import com.hbs.hsbbo.admin.dto.response.AdminLogListResponse;
import com.hbs.hsbbo.admin.dto.response.AdminLogResponse;
import com.hbs.hsbbo.admin.repository.AdminLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class AdminLogService {

    private final AdminLogRepository adminLogRepository;



    public void save(AdminLog log) {
        adminLogRepository.save(log);
    }

    public AdminLogListResponse getAdminLogList(String keyword,
                                                LocalDate start,
                                                LocalDate end,
                                                int page,
                                                int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "logDate"));

        LocalDateTime startDateTime = (start != null) ? start.atStartOfDay() : null;
        LocalDateTime endDateTime = (end != null) ? end.atTime(23, 59, 59) : null;

        Page<AdminLog> result = adminLogRepository.searchAdminLogs(
                keyword.isEmpty() ? null : keyword,
                startDateTime,
                endDateTime,
                pageable
        );

        List<AdminLogResponse> list = result.getContent().stream()
                .map(AdminLogResponse::fromEntity)
                .collect(Collectors.toList());

        return new AdminLogListResponse(
                list,
                result.getTotalElements(),
                result.getTotalPages()
        );
    }

    public boolean existsRecentLog(
            String adminId,
            String action,
            String url,
            int seconds) {

        // 초단위
        // LocalDateTime since = LocalDateTime.now().minusSeconds(seconds);
        // 분단위
        LocalDateTime since = LocalDateTime.now().minusMinutes(1);
        return adminLogRepository.existsByAdminIdAndActionAndUrlAndLogDateAfter(
                adminId, action, url, since
        );
    }


}
