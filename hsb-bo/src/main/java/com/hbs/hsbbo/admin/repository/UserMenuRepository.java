package com.hbs.hsbbo.admin.repository;

import com.hbs.hsbbo.admin.domain.entity.UserMenu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserMenuRepository extends JpaRepository<UserMenu, Long> {
    List<UserMenu> findByDelTf(String delTf);
    List<UserMenu> findByParentIdOrderByOrderSeqAsc(Long parentId);

}
