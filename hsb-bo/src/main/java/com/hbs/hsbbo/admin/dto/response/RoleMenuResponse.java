package com.hbs.hsbbo.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class RoleMenuResponse {

    private List<MenuPermission> menuPermissions;

    @Data
    @AllArgsConstructor
    public static class MenuPermission {
        private Long menuId;
        private String name;
        private String url;
        private int depth;
        private Integer parentId;
        private boolean read;
        private boolean write;
        private boolean delete;
    }

}
