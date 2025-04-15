package com.hbs.hsbbo.admin.repository;

import com.hbs.hsbbo.admin.domain.entity.AdminMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AdminMenuRepository extends JpaRepository<AdminMenu, Integer>{
    // del_tf가 'N'인 (삭제되지 않은) 메뉴만 순서대로 조회
    List<AdminMenu> findByDelTfOrderByOrderSequenceAsc(String delTf);
}
