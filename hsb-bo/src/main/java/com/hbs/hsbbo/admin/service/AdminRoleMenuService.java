package com.hbs.hsbbo.admin.service;

import com.hbs.hsbbo.admin.domain.entity.AdminMenu;
import com.hbs.hsbbo.admin.domain.entity.AdminRole;
import com.hbs.hsbbo.admin.domain.entity.AdminRoleMenu;
import com.hbs.hsbbo.admin.repository.AdminMenuRepository;
import com.hbs.hsbbo.admin.repository.AdminRoleMenuRepository;
import com.hbs.hsbbo.admin.repository.AdminRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminRoleMenuService {

    private final AdminRoleRepository adminRoleRepository;
    private final AdminMenuRepository adminMenuRepository;
    private final AdminRoleMenuRepository adminRoleMenuRepository;

    @Transactional(readOnly = true)
    public List<Long> getMenuIdsByRoleId(Long roleId) {
        return adminRoleMenuRepository.findByRoleIdAndDelTf(roleId, "N").stream()
                .map(roleMenu -> roleMenu.getMenu().getId())
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateRoleMenus(Long roleId, List<Long> menuIds) {
        // 1. 기존 매핑 제거
        adminRoleMenuRepository.deleteByRoleId(roleId);

        // 2. 새 매핑 저장
        AdminRole role = adminRoleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("권한 그룹이 존재하지 않습니다."));

        List<AdminMenu> menus = adminMenuRepository.findAllById(menuIds);

        List<AdminRoleMenu> roleMenus = menus.stream()
                .map(menu -> AdminRoleMenu.builder()
                        .role(role)
                        .menu(menu)
                        .useTf("Y")
                        .delTf("N")
                        .build())
                .collect(Collectors.toList());

        adminRoleMenuRepository.saveAll(roleMenus);
    }
}
