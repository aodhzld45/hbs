package com.hbs.hsbbo.admin.maintenance.dto.response;

import com.hbs.hsbbo.admin.maintenance.dto.MaintenanceRuleDto;
import com.hbs.hsbbo.admin.maintenance.model.MaintenanceConfig;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class MaintenanceConfigResponse {

    private boolean enabled;
    private Integer pollIntervalSec;
    private String adminBypassPrefix;
    private List<MaintenanceRuleDto> rules;

    public static MaintenanceConfigResponse from(MaintenanceConfig model) {
        return MaintenanceConfigResponse.builder()
                .enabled(model.isEnabled())
                .pollIntervalSec(model.getPollIntervalSec())
                .adminBypassPrefix(model.getAdminBypassPrefix())
                .rules(model.getRules())
                .build();
    }
}
