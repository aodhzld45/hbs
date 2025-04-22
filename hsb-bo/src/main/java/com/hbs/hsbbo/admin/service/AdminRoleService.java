package com.hbs.hsbbo.admin.service;

import com.hbs.hsbbo.admin.domain.entity.AdminRole;
import com.hbs.hsbbo.admin.repository.AdminRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminRoleService {
    private final AdminRoleRepository roleRepository;

    // 관리자 그룹 목록 조회
    public List<AdminRole> getAllRoles() {
        return roleRepository.findAllByDelTf("N"); // 'N'만 조회
    }

    // 관리자 그룹 등록
    public AdminRole createAdminRole(AdminRole role) {
        role.setCreatedAt(LocalDateTime.now());
        role.setUpdatedAt(LocalDateTime.now());
        role.setDelTf("N");

        return roleRepository.save(role);
    }

    // 관리자 그룹 수정
    public AdminRole updateAdminRole(Long id, AdminRole updated) {
        return roleRepository.findById(id)
                .map(role -> {
                    role.setName(updated.getName());
                    role.setDescription(updated.getDescription());
                    role.setUseTf(updated.getUseTf());
                    role.setUpdatedAt(LocalDateTime.now());
                    return roleRepository.save(role);
                })
                .orElseThrow(() -> new IllegalArgumentException("권한 그룹이 존재하지 않습니다."));
    }

    // 관리자 그룹 삭제
    public void softDeleteAdminRole(Long id) {
        roleRepository.findById(id).ifPresent(role -> {
            role.setDelTf("Y");
            role.setUpdatedAt(LocalDateTime.now());
            roleRepository.save(role);
        });
    }




}
