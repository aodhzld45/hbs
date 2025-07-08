package com.hbs.hsbbo.admin.controller;

import com.hbs.hsbbo.admin.domain.entity.Admin;
import com.hbs.hsbbo.admin.dto.request.LoginRequest;
import com.hbs.hsbbo.admin.repository.AdminRepository;
import com.hbs.hsbbo.common.config.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AuthController {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;


    @GetMapping("/login")
    public ResponseEntity<?> getIp(HttpServletRequest request) {
        String clientIp = request.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isBlank()) {
            clientIp = request.getRemoteAddr(); // 프록시 없을 경우
        }

        return ResponseEntity.ok(Map.of("ip", clientIp));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest,
                                   HttpServletRequest request) {
        Optional<Admin> adminOpt = adminRepository.findByIdAndPassword(
                loginRequest.getId(),
                loginRequest.getPassword()
        );

        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();

            // JWT
            String token = jwtTokenProvider.createToken(admin.getId(), "ADMIN");

            // 권한도 함께 내려보냄
            List<String> roles = List.of("ROLE_ADMIN");

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "adminId", admin.getId(),
                    "name", admin.getName(),
                    "groupId", admin.getGroupId(),
                    "tel", admin.getTel(),
                    "memo", admin.getMemo(),
                    "email", admin.getEmail(),
                    "roles", roles
            ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login 실패");
        }
    }

    // 현재 로그인된 관리자 정보 반환 (JWT 인증 기반)
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentAdmin(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증되지 않은 사용자입니다.");
        }

        Object principalObj = authentication.getPrincipal();

        if (principalObj instanceof Admin currentAdmin) {
            // 권한 목록 꺼내기
            List<String> roles = authentication.getAuthorities()
                    .stream()
                    .map(a -> a.getAuthority())
                    .toList();

            return ResponseEntity.ok(Map.of(
                    "adminId", currentAdmin.getId(),
                    "name", currentAdmin.getName(),
                    "groupId", currentAdmin.getGroupId(),
                    "tel", currentAdmin.getTel(),
                    "memo", currentAdmin.getMemo(),
                    "email", currentAdmin.getEmail(),
                    "roles", roles
            ));

        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증 정보가 올바르지 않습니다.");
        }
    }



    // 기존 로그인 API 외에 추가
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
            System.out.println("로그아웃 성공");
        }
        return ResponseEntity.ok("Logout 성공");
    }

    // 세션 인증
    @GetMapping("/session-check")
    public ResponseEntity<?> checkSession(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute("admin") != null) {
            System.out.println("세션 검증 완료" + session.getAttribute("admin"));
            return ResponseEntity.ok("인증된 세션");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("세션 없음");
        }
    }

    // 전체 관리자 계정 목록 조회
    @GetMapping("/accounts")
    public ResponseEntity<List<Admin>> getAllAdmins() {
        List<Admin> admins = adminRepository.findAll();
        return ResponseEntity.ok(admins);
    }

    // 관리자 계정 수정 (간단한 예시: 이름과 이메일만 수정)
    @PutMapping("/accounts/{id}")
    public ResponseEntity<?> updateAdmin(@PathVariable("id") String id, @RequestBody Admin updatedAdmin) {
        return adminRepository.findById(id)
                .map(admin -> {
                    // 필요한 필드만 업데이트 (원하는 대로 수정)
                    admin.setName(updatedAdmin.getName());
                    admin.setEmail(updatedAdmin.getEmail());
                    // 추가 수정 필드가 있다면 아래 업데이트
                    adminRepository.save(admin);
                    return ResponseEntity.ok(admin);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 관리자 계정 삭제 (논리 삭제: isDeleted 값을 true로 변경)
    @DeleteMapping("/accounts/{id}")
    public ResponseEntity<?> deleteAdmin(@PathVariable("id") String id) {
        return adminRepository.findById(id)
                .map(admin -> {
                    admin.setIsDeleted(true);
                    adminRepository.save(admin);
                    return ResponseEntity.ok().build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 관리자 등록 API
    @PostMapping("/register")
    public ResponseEntity<?> registerAdmin(@Valid @RequestBody Admin admin) {
        // 동일한 id가 이미 존재하는지 확인
        if(adminRepository.existsById(admin.getId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("해당 아이디의 관리자가 이미 존재합니다.");
        }
        // (필요하다면 여기서 비밀번호 암호화 처리, 예: admin.setPassword(passwordEncoder.encode(admin.getPassword())) )

        // 생성일 및 수정일 설정
        admin.setCreatedAt(LocalDateTime.now());
        admin.setUpdatedAt(LocalDateTime.now());
        // 기본 값 설정 (예: isDeleted 기본 false)
        if(admin.getIsDeleted() == null) {
            admin.setIsDeleted(false);
        }

        // 관리자 등록 (저장)
        Admin savedAdmin = adminRepository.save(admin);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedAdmin);
    }

}
