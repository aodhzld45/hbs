package com.hbs.hsbbo.admin.repository;

import com.hbs.hsbbo.admin.domain.entity.AdminRoleMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AdminRoleMenuRepository extends JpaRepository<AdminRoleMenu, Long> {

    @Query("""
            SELECT arm FROM AdminRoleMenu arm
            JOIN FETCH arm.menu m
            WHERE arm.role.id = :roleId
              AND m.useTf = 'Y'
              AND m.delTf = 'N'
            """)
    List<AdminRoleMenu> findWithMenuByRoleId(@Param("roleId") Long roleId);

    List<AdminRoleMenu> findByRoleId(Long roleId);

    void deleteByRoleId(Long roleId);
}
