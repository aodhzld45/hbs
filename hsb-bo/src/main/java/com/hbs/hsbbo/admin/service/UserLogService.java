package com.hbs.hsbbo.admin.service;

import com.hbs.hsbbo.admin.domain.entity.UserLog;
import com.hbs.hsbbo.admin.dto.request.UserLogRequest;
import com.hbs.hsbbo.admin.dto.response.UserLogResponse;
import com.hbs.hsbbo.admin.repository.UserLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RequiredArgsConstructor
@Service
public class UserLogService {
    private final UserLogRepository repository;


    // 사용자 로그 저장
    public UserLogResponse saveLog(UserLogRequest request, String clientIp) {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        UserLog logData = new UserLog();

        logData.setSid(request.getSid());
        logData.setUrl(request.getUrl());
        logData.setReferer(request.getReferer());
        logData.setDiviceType(request.getDiviceType());
        logData.setPageType(request.getPageType());
        logData.setDepth01(request.getDepth01());
        logData.setDepth02(request.getDepth02());
        logData.setDepth03(request.getDepth03());
        logData.setParam01(request.getParam01());
        logData.setParam02(request.getParam02());
        logData.setParam03(request.getParam03());

        logData.setRefIp(clientIp);
        logData.setLogDate(now);
        logData.setRegDate(now);
        logData.setUseTF("Y");
        logData.setDelTF("N");

        logData.setYmd(now.format(fmt));
        logData.setYyyy(String.valueOf(now.getYear()));
        logData.setMm(String.format("%02d", now.getMonthValue()));
        logData.setDd(String.format("%02d", now.getDayOfMonth()));
        logData.setHh(String.format("%02d", now.getHour()));
        logData.setMi(String.format("%02d", now.getMinute()));
        logData.setWk(String.valueOf(now.getDayOfWeek().getValue()));

        UserLog saved = repository.save(logData);

        return UserLogResponse.builder()
                .logId(saved.getLogId())
                .sid(saved.getSid())
                .url(saved.getUrl())
                .referer(saved.getReferer())
                .diviceType(saved.getDiviceType())
                .pageType(saved.getPageType())
                .depth01(saved.getDepth01())
                .depth02(saved.getDepth02())
                .depth03(saved.getDepth03())
                .param01(saved.getParam01())
                .param02(saved.getParam02())
                .param03(saved.getParam03())
                .ymd(saved.getYmd())
                .yyyy(saved.getYyyy())
                .mm(saved.getMm())
                .dd(saved.getDd())
                .hh(saved.getHh())
                .mi(saved.getMi())
                .wk(saved.getWk())
                .refIp(saved.getRefIp())
                .logDate(saved.getLogDate())
                .build();


    }



}
