package com.hbs.hsbbo.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRoleResponse {
    private String adminId;
    private String adminName;
    private String email;
    private Long roleId;
    private String roleName;
}

