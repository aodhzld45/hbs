package com.hbs.hsbbo.admin.dto.request;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserLogRequest {
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
}
