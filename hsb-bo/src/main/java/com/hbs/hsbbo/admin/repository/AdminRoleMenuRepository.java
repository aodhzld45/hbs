package com.hbs.hsbbo.admin.repository;

import com.hbs.hsbbo.admin.domain.entity.AdminRoleMenu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminRoleMenuRepository extends JpaRepository<AdminRoleMenu, Long> {
    List<AdminRoleMenu> findByRoleId(Long roleId);

    void deleteByRoleId(Long roleId);
}
