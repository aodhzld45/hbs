package com.hbs.hsbbo.admin.maintenance.dto.request;

import com.hbs.hsbbo.admin.maintenance.dto.MaintenanceRuleDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class MaintenanceConfigRequest {
    @NotNull
    private Boolean enabled;

    private Integer pollIntervalSec;     // 프론트 폴링 주기
    private String adminBypassPrefix;    // 예: "/admin"

    @NotNull
    private List<@Valid MaintenanceRuleDto> rules;
}
