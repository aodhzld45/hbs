package com.hbs.hsbbo.admin.maintenance.model;

import com.hbs.hsbbo.admin.maintenance.dto.MaintenanceRuleDto;
import com.hbs.hsbbo.admin.maintenance.dto.request.MaintenanceConfigRequest;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceConfig {

    private boolean enabled;
    private Integer pollIntervalSec;
    private String adminBypassPrefix;

    @Builder.Default
    private List<MaintenanceRuleDto> rules = new ArrayList<>();

    public static MaintenanceConfig defaultConfig() {
        return MaintenanceConfig.builder()
                .enabled(false)
                .pollIntervalSec(15)
                .adminBypassPrefix("/admin")
                .rules(new ArrayList<>())
                .build();
    }

    public static MaintenanceConfig from(MaintenanceConfigRequest req) {
        return MaintenanceConfig.builder()
                .enabled(Boolean.TRUE.equals(req.getEnabled()))
                .pollIntervalSec(req.getPollIntervalSec() == null ? 15 : req.getPollIntervalSec())
                .adminBypassPrefix(req.getAdminBypassPrefix() == null ? "/admin" : req.getAdminBypassPrefix())
                .rules(req.getRules())
                .build();
    }
}
