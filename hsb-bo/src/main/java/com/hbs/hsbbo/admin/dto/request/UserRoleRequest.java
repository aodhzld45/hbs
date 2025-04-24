package com.hbs.hsbbo.admin.dto.request;

import lombok.Data;

@Data
public class UserRoleRequest {
    private String adminId;
    private Long groupId;
    private Long roleId;

}
