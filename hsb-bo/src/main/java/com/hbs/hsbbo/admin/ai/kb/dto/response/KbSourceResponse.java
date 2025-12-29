package com.hbs.hsbbo.admin.ai.kb.dto.response;

import com.hbs.hsbbo.admin.ai.kb.domain.entity.KbSource;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KbSourceResponse {

    private Long id;
    private Long siteKeyId;

    private String sourceName;
    private String description;

    private String useTf;
    private String delTf;

    private String regAdm;
    private LocalDateTime regDate;
    private String upAdm;
    private LocalDateTime upDate;
    private String delAdm;
    private LocalDateTime delDate;

    public static KbSourceResponse from(KbSource e) {
        if (e == null) return null;
        return KbSourceResponse.builder()
                .id(e.getId())
                .siteKeyId(e.getSiteKeyId())
                .sourceName(e.getSourceName())
                .description(e.getDescription())
                .useTf(e.getUseTf())
                .delTf(e.getDelTf())
                .regAdm(e.getRegAdm())
                .regDate(e.getRegDate())
                .upAdm(e.getUpAdm())
                .upDate(e.getUpDate())
                .delAdm(e.getDelAdm())
                .delDate(e.getDelDate())
                .build();
    }
}
