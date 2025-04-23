package com.hbs.hsbbo.admin.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class RoleMenuRequest {
    private List<MenuPermission> menuPermissions;

    @Data
    public static class MenuPermission {
        private Long menuId;
        private boolean read;   // read_tf
        private boolean write;  // write_tf → use_tf 대체 안 함
        private boolean delete; // delete_tf → del_tf 대체 안 함
    }
}
