package com.hbs.hsbbo.admin.maintenance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MaintenanceRuleDto {

    @NotBlank
    private String id;

    @NotNull
    private Boolean enabled;

    @NotBlank
    private String matchType; // EXACT | PREFIX | REGEX

    @NotBlank
    private String path; // "/" or "/link/youtube" or "^/event/\\d+$"

    @NotBlank
    private String type; // MAINTENANCE | COMING_SOON | NOTICE

    private String title;
    private String description;
    private String expectedEndAt; // ISO string
    private String helpText;
    private String helpHref;
    private Integer priority;
}
