package com.hbs.hsbbo.admin.ai.sitekey.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteKeyStatusRequest {
    @NotBlank
    @Pattern(regexp = "ACTIVE|SUSPENDED|REVOKED")
    private String status;

    /** 왜 바꾸는지 운영 메모(선택) */
    private String notes;
}
