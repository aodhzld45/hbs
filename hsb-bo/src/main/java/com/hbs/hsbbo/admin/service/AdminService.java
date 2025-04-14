package com.hbs.hsbbo.admin.service;

import com.hbs.hsbbo.admin.domain.entity.Admin;
import com.hbs.hsbbo.admin.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class AdminService implements UserDetailsService {

    @Autowired
    private AdminRepository adminRepository;

    @Override
    public UserDetails loadUserByUsername(String id) throws UsernameNotFoundException {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("해당 아이디로 등록된 관리자가 없습니다: " + id));

        // 실제 운영 환경에서는 admin.getPassword()에 암호화된 비밀번호가 저장되어 있어야 합니다.
        return User.builder()
                .username(admin.getId())
                .password(admin.getPassword())
                .roles("ADMIN")
                .build();
    }
}
