package com.hbs.hsbbo.admin.dto.request.page;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

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

    private String existingFileIds; // "1,2,3"

    public List<Long> getExistingFileIdList() {
        if (existingFileIds == null || existingFileIds.isBlank()) return Collections.emptyList();
        return Arrays.stream(existingFileIds.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Long::parseLong)
                .collect(Collectors.toList());
    }


}
