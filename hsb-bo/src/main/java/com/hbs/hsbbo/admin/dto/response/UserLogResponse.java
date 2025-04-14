package com.hbs.hsbbo.admin.dto.response;

import com.hbs.hsbbo.admin.domain.entity.UserLog;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserLogResponse {

    private Long logId;
    private String sid;
    private String url;
    private String referer;
    private String diviceType;
    private String pageType;
    private String depth01;
    private String depth02;
    private String depth03;
    private String param01;
    private String param02;
    private String param03;
    private String ymd;
    private String yyyy;
    private String mm;
    private String dd;
    private String hh;
    private String mi;
    private String wk;
    private String refIp;
    private LocalDateTime logDate;

    public static UserLogResponse fromEntity(UserLog entity) {
        return UserLogResponse.builder()
                .logId(entity.getLogId())
                .sid(entity.getSid())
                .url(entity.getUrl())
                .referer(entity.getReferer())
                .diviceType(entity.getDiviceType())
                .pageType(entity.getPageType())
                .depth01(entity.getDepth01())
                .depth02(entity.getDepth02())
                .depth03(entity.getDepth03())
                .param01(entity.getParam01())
                .param02(entity.getParam02())
                .param03(entity.getParam03())
                .ymd(entity.getYmd())
                .yyyy(entity.getYyyy())
                .mm(entity.getMm())
                .dd(entity.getDd())
                .hh(entity.getHh())
                .mi(entity.getMi())
                .wk(entity.getWk())
                .refIp(entity.getRefIp())
                .logDate(entity.getLogDate())
                .build();
    }
}
