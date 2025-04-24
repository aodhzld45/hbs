package com.hbs.hsbbo.admin.repository;

import com.hbs.hsbbo.admin.domain.entity.AdminRoleUser;
import com.hbs.hsbbo.admin.dto.response.UserRoleResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AdminRoleUserRepository extends JpaRepository<AdminRoleUser, Long> {
    List<AdminRoleUser> findByAdmin_Id(String adminId); // 사용자 기준으로 권한 목록

    Optional<AdminRoleUser> findByAdmin_IdAndRole_Id(String adminId, Long roleId); // 단일 매핑
    //사용자 ID 기준으로 모든 권한 매핑 삭제
    void deleteByAdmin_Id(String adminId);

    @Query("SELECT new com.hbs.hsbbo.admin.dto.response.UserRoleResponse(" +
            "a.id, a.name, a.email, r.id, r.name) " +
            "FROM Admin a " +
            "LEFT JOIN AdminRoleUser aru ON a.id = aru.admin.id " +
            "LEFT JOIN AdminRole r ON aru.role.id = r.id")
    List<UserRoleResponse> findAllAdminRoleMappings();

}
