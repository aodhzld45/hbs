package com.hbs.hsbbo.admin.dto.response;

import com.hbs.hsbbo.admin.domain.entity.AppCorsOrigin;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class CorsOriginResponse {

    private Long id;
    private String originPat;
    private String description;
    private String tenantId;
    private String useTf;
    private String delTf;
    private LocalDateTime regDate;
    private LocalDateTime upDate;
    private LocalDateTime delDate;

    public static CorsOriginResponse from(AppCorsOrigin e) {
        return CorsOriginResponse.builder()
                .id(e.getId())
                .originPat(e.getOriginPat())
                .description(e.getDescription())
                .tenantId(e.getTenantId())
                .useTf(e.getUseTf())
                .delTf(e.getDelTf())
                .regDate(e.getRegDate())
                .upDate(e.getUpDate())
                .delDate(e.getDelDate())
                .build();
    }

}
