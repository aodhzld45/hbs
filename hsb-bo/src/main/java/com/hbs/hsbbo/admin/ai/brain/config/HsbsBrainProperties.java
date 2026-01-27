package com.hbs.hsbbo.admin.ai.brain.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "hsbs.brain")
public class HsbsBrainProperties {
    private String baseUrl; // FastAPI Brain 서버의 base URL (예: http://localhost:8000 or http://.../v1)
    private String apiKey;  // 내부 통신용 API 키 (헤더에 실어 보낼 값)
    private boolean enabled = true; // Brain 연동 on/off 스위치
    private String ingestPath; // KbJob 처리 스케줄러/워커용 엔드포인트
    private Integer timeoutMs = 15000;

}
