package com.hbs.hsbbo.admin.ai.kb.dto.request;

import jakarta.validation.constraints.*;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Getter
@Setter
@Slf4j
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KbSourceRequest {

    @NotNull
    private Long siteKeyId;

    @NotBlank
    @Size(max = 100)
    private String sourceName;

    @Size(max = 255)
    private String description;

    private String useTf;       // "Y"/"N" (null 허용: 기본값 처리)
    private String delTf;       // "N" 고정 권장

}
