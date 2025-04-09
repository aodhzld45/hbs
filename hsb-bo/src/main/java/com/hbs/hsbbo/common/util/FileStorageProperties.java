package com.hbs.hsbbo.common.util;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/*
*  파일 관리를 위한 클래스 - 빈 주입받을꺼임 말리지마셈
* 
* */

@Getter
@Setter
@ConfigurationProperties(prefix = "file")
public class FileStorageProperties {
    private String uploadPath;

    @PostConstruct
    public void init() {
        System.out.println("📂 [파일 저장 경로] uploadPath = " + uploadPath);
    }

}
