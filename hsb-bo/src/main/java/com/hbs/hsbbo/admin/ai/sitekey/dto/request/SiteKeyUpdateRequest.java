package com.hbs.hsbbo.admin.ai.sitekey.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteKeyUpdateRequest {
    /** 상태 변경 포함(선택) */
    @Pattern(regexp = "ACTIVE|SUSPENDED|REVOKED")
    private String status;

    @Size(max = 50)
    private String planCode;

    @PositiveOrZero
    private Integer dailyCallLimit;

    @PositiveOrZero
    private Long dailyTokenLimit;

    @PositiveOrZero
    private Long monthlyTokenLimit;

    @PositiveOrZero
    private Integer rateLimitRps;

    @Size(max = 200)
    private List<@NotBlank @Size(max = 255) String> allowedDomains;

    private Long defaultWidgetConfigId;
    private Long defaultPromptProfileId;

    @Size(max = 255)
    private String notes;

}
