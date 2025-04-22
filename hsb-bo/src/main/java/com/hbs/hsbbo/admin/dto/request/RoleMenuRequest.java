package com.hbs.hsbbo.admin.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class RoleMenuRequest {
    private List<Long> menuIds;
}