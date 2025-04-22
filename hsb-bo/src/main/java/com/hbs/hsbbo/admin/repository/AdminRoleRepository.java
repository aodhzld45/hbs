package com.hbs.hsbbo.admin.repository;

import com.hbs.hsbbo.admin.domain.entity.AdminRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminRoleRepository extends JpaRepository<AdminRole,Long> {
    List<AdminRole> findAllByDelTf(String delTf); //'N'만 가져오기

}
