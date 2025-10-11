package com.hbs.hsbbo.admin.ai.sitekey.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteKeySummaryResponse {
    private Long id;
    private String siteKey;
    private String status;
    private String planCode;

    private Integer dailyCallLimit;
    private Long dailyTokenLimit;

    private Integer domainCount;

    private LocalDateTime regDate;
    private LocalDateTime upDate;

}
