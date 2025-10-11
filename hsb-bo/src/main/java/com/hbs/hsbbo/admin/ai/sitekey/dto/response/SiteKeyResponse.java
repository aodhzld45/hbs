package com.hbs.hsbbo.admin.ai.sitekey.dto.response;


import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteKeyResponse {
    private Long id;
    private String siteKey;

    private String status;              // ACTIVE|SUSPENDED|REVOKED
    private String planCode;

    private Integer dailyCallLimit;
    private Long dailyTokenLimit;
    private Long monthlyTokenLimit;
    private Integer rateLimitRps;

    private List<String> allowedDomains;

    private Long defaultWidgetConfigId;
    private Long defaultPromptProfileId;

    private String notes;

    // 감사 필드
    private String useTf;
    private String delTf;
    private String regAdm;
    private LocalDateTime regDate;
    private String upAdm;
    private LocalDateTime upDate;
    private String delAdm;
    private LocalDateTime delDate;
}
