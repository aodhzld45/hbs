package com.hbs.hsbbo.admin.service;

import com.hbs.hsbbo.admin.domain.entity.AdminLog;
import com.hbs.hsbbo.admin.repository.AdminLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class AdminLogService {

    private final AdminLogRepository adminLogRepository;

    public void save(AdminLog log) {
        adminLogRepository.save(log);
    }

}
