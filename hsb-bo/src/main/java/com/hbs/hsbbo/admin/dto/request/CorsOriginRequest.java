package com.hbs.hsbbo.admin.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CorsOriginRequest {
    /**
     * 생성(Create) 시: 필수
     * 수정(Update) 시: 선택 (정책상 변경 불허로 할 수도 있고, 허용 시 형식 검증만 수행)
     */
    @Size(max = 255, message = "originPat은 최대 255자입니다.")
    @Pattern(
            regexp = "^(https?://)((\\*\\.)?[A-Za-z0-9-]+(\\.[A-Za-z0-9-]+)+|localhost)(:\\d{1,5})?$",
            message = "유효하지 않은 Origin 형식입니다. 예) https://www.hsbs.kr, https://*.example.com, http://localhost:5173"
    )
    private String originPat;

    @Size(max = 255, message = "description은 최대 255자입니다.")
    private String description;

    /** 멀티테넌트가 아니면 null 유지 */
    @Size(max = 50, message = "tenantId는 최대 50자입니다.")
    private String tenantId;
}
