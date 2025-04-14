package com.hbs.hsbbo.admin.controller;

import com.hbs.hsbbo.admin.dto.request.LoginRequest;
import com.hbs.hsbbo.admin.repository.AdminRepository;
import com.hbs.hsbbo.admin.domain.entity.Admin;

import java.util.Optional;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.authentication.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AuthController {

    @Autowired
    private AdminRepository adminRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest,
                                   HttpServletRequest request) {
            // 전달받은 id와 password로 관리자 검색(평문 비교)
            Optional<Admin> adminOpt = adminRepository.findByIdAndPassword(
                    loginRequest.getId(),
                    loginRequest.getPassword()
            );

            if (adminOpt.isPresent()) {
                // 인증 성공: 세션 생성
                request.getSession(true);
                return ResponseEntity.ok("Login 성공");
            } else {
                // 인증 실패: 적절한 실패 메시지 반환
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login 실패");
            }
    }


    // 기존 로그인 API 외에 추가
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok("Logout 성공");
    }
}
