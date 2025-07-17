package com.hbs.hsbbo.admin.dto.request.page;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PageSectionRequest {

    private Long pageId; // FK

    @NotBlank
    private String sectionName;

    @NotBlank
    private String layoutType;
    private String optionJson; // Tailwind 옵션
    private Integer orderSeq;
    private String useTf;

}
