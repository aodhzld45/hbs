package com.hbs.hsbbo.admin.repository;

import com.hbs.hsbbo.admin.domain.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, String>{
    // id와 password가 일치하는 관리자를 조회하는 메서드
    Optional<Admin> findByIdAndPassword(String id, String password);
}
