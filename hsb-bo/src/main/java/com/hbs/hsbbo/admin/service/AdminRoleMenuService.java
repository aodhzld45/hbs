package com.hbs.hsbbo.admin.service;

import com.hbs.hsbbo.admin.domain.entity.AdminMenu;
import com.hbs.hsbbo.admin.domain.entity.AdminRole;
import com.hbs.hsbbo.admin.domain.entity.AdminRoleMenu;
import com.hbs.hsbbo.admin.dto.request.RoleMenuRequest;
import com.hbs.hsbbo.admin.dto.response.RoleMenuResponse;
import com.hbs.hsbbo.admin.repository.AdminMenuRepository;
import com.hbs.hsbbo.admin.repository.AdminRoleMenuRepository;
import com.hbs.hsbbo.admin.repository.AdminRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminRoleMenuService {

    private final AdminRoleRepository adminRoleRepository;
    private final AdminMenuRepository adminMenuRepository;
    private final AdminRoleMenuRepository adminRoleMenuRepository;

    // 1. 권한 그룹의 메뉴 권한 전체 조회 (Response 반환용)
//    @Transactional(readOnly = true)
//    public RoleMenuResponse getRoleMenuPermissions(Long roleId) {
//        List<AdminRoleMenu> mappings = adminRoleMenuRepository.findByRoleId(roleId);
//
//        List<RoleMenuResponse.MenuPermission> permissions = mappings.stream()
//                .map(rm -> new RoleMenuResponse.MenuPermission(
//                        rm.getMenu().getId(),
//                        "Y".equalsIgnoreCase(rm.getReadTf()),
//                        "Y".equalsIgnoreCase(rm.getWriteTf()),
//                        "Y".equalsIgnoreCase(rm.getDeleteTf())
//                ))
//                .toList();
//
//        return new RoleMenuResponse(permissions);
//    }

    // 2. 권한 그룹에 대한 메뉴 권한 저장
    @Transactional
    public void updateRoleMenus(Long roleId, List<RoleMenuRequest.MenuPermission> permissions) {
        adminRoleMenuRepository.deleteByRoleId(roleId);

        AdminRole role = adminRoleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("권한 그룹이 존재하지 않습니다."));

        List<Long> menuIds = permissions.stream().map(RoleMenuRequest.MenuPermission::getMenuId).toList();
        Map<Long, AdminMenu> menuMap = adminMenuRepository.findAllById(menuIds)
                .stream()
                .collect(Collectors.toMap(AdminMenu::getId, m -> m));

        List<AdminRoleMenu> mappings = new ArrayList<>();

        for (RoleMenuRequest.MenuPermission p : permissions) {
            AdminMenu menu = menuMap.get(p.getMenuId());
            if (menu == null) continue;

            AdminRoleMenu roleMenu = new AdminRoleMenu();
            roleMenu.setRole(role);
            roleMenu.setMenu(menu);
            roleMenu.setReadTf(p.isRead() ? "Y" : "N");
            roleMenu.setWriteTf(p.isWrite() ? "Y" : "N");
            roleMenu.setDeleteTf(p.isDelete() ? "Y" : "N");

            mappings.add(roleMenu);
        }

        adminRoleMenuRepository.saveAll(mappings);
    }

    // 추가
    @Transactional(readOnly = true)
    public RoleMenuResponse getRoleMenuPermissions(Long roleId) {
        List<AdminRoleMenu> mappings = adminRoleMenuRepository.findWithMenuByRoleId(roleId);

        List<RoleMenuResponse.MenuPermission> permissions = mappings.stream()
                .map(rm -> {
                    AdminMenu menu = rm.getMenu();
                    return new RoleMenuResponse.MenuPermission(
                            menu.getId(),
                            menu.getName(),
                            menu.getUrl(),
                            menu.getDepth(),
                            menu.getParentId(),
                            "Y".equalsIgnoreCase(rm.getReadTf()),
                            "Y".equalsIgnoreCase(rm.getWriteTf()),
                            "Y".equalsIgnoreCase(rm.getDeleteTf())
                    );
                })
                .toList();

        return new RoleMenuResponse(permissions);
    }

}
