package com.hbs.hsbbo.admin.service;

import com.hbs.hsbbo.admin.domain.entity.Admin;
import com.hbs.hsbbo.admin.domain.entity.AdminRole;
import com.hbs.hsbbo.admin.domain.entity.AdminRoleUser;
import com.hbs.hsbbo.admin.dto.response.UserRoleResponse;
import com.hbs.hsbbo.admin.repository.AdminRepository;
import com.hbs.hsbbo.admin.repository.AdminRoleRepository;
import com.hbs.hsbbo.admin.repository.AdminRoleUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminRoleUserService {
    private final AdminRoleUserRepository adminRoleUserRepository;
    private final AdminRepository adminRepository;
    private final AdminRoleRepository adminRoleRepository;

    // 사용자 + 권한 목록 조회
    public List<UserRoleResponse> getAllUsersWithRoles() {
        List<AdminRoleUser> mappings = adminRoleUserRepository.findAll();

        return mappings.stream().map(mapping -> {
            Admin admin = mapping.getAdmin();
            AdminRole role = mapping.getRole();

            UserRoleResponse res = new UserRoleResponse();
            res.setAdminId(admin.getId());
            res.setAdminName(admin.getName());
            res.setEmail(admin.getEmail());
            res.setRoleId(role.getId());
            res.setRoleName(role.getName());

            return res;
        }).collect(Collectors.toList());
    }

    // 사용자에게 권한 지정
    public void assignRoleToUser(String adminId, Long roleId) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("해당 관리자가 존재하지 않습니다."));
        AdminRole role = adminRoleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("해당 권한 그룹이 존재하지 않습니다."));

        // 기존 권한을 삭제
        adminRoleUserRepository.deleteByAdmin_Id(adminId);

        // 새 매핑을 생성
        AdminRoleUser mapping = new AdminRoleUser();
        mapping.setAdmin(admin);
        mapping.setRole(role);
        mapping.setAssignedAt(LocalDateTime.now());

        adminRoleUserRepository.save(mapping);

    }
}
