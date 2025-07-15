package com.hbs.hsbbo.admin.controller;

import com.hbs.hsbbo.admin.aop.AdminActionLog;
import com.hbs.hsbbo.admin.domain.entity.Admin;
import com.hbs.hsbbo.admin.dto.request.LoginRequest;
import com.hbs.hsbbo.admin.repository.AdminRepository;
import com.hbs.hsbbo.common.config.JwtTokenProvider;
import com.hbs.hsbbo.common.util.SecurityUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
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

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/login")
    public ResponseEntity<?> getIp(HttpServletRequest request) {
        String clientIp = request.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isBlank()) {
            clientIp = request.getRemoteAddr(); // 프록시 없을 경우
        }

        return ResponseEntity.ok(Map.of("ip", clientIp));
    }

    @PostMapping("/login")
    @AdminActionLog(
            action = "로그인",
            detail = "관리자 계정 {id} 로그인"
    )
        public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest,
                                   HttpServletRequest request) {
        Optional<Admin> adminOpt = adminRepository.findById(loginRequest.getId());

        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();

            // 암호화된 비밀번호 비교
            if (!passwordEncoder.matches(loginRequest.getPassword(), admin.getPassword())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login 실패");
            }

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



    // 기존 로그아웃
    @PostMapping("/logout")
    @AdminActionLog(
            action = "로그아웃",
            detail = "관리자 계정 {id} 로그아웃"
    )
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        String token = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        }

        String adminId = SecurityUtil.getCurrentAdminId();

        request.setAttribute("logArgs", Map.of("id", adminId));

        return ResponseEntity.ok("Logout 성공. 클라이언트에서 토큰을 삭제하세요.");
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
        List<Admin> admins = adminRepository.findIsDeletedFalse();
        return ResponseEntity.ok(admins);
    }

    // 관리자 계정 수정 (간단한 예시: 이름과 이메일만 수정)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAdmin(@PathVariable("id") String id,
                                         @RequestBody Admin updatedAdmin) {
        return adminRepository.findById(id)
                .map(admin -> {
                    admin.setName(updatedAdmin.getName());
                    admin.setEmail(updatedAdmin.getEmail());
                    admin.setTel(updatedAdmin.getTel());
                    admin.setMemo(updatedAdmin.getMemo());
                    admin.setGroupId(updatedAdmin.getGroupId());

                    // 비밀번호가 비어있지 않으면 새 비밀번호로 업데이트
                    if (updatedAdmin.getPassword() != null && !updatedAdmin.getPassword().isEmpty()) {
                        String encodedPassword = passwordEncoder.encode(updatedAdmin.getPassword());
                        admin.setPassword(encodedPassword);
                    }

                    adminRepository.save(admin);
                    return ResponseEntity.ok(admin);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 관리자 계정 삭제 (논리 삭제: isDeleted 값을 true로 변경)
    @DeleteMapping("/{id}")
    @AdminActionLog(
            action = "삭제",
            detail = "관리자 계정 {id} 삭제"
    )
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
    @AdminActionLog(
            action = "등록",
            detail = "관리자 계정 {id} 등록"
    )
    public ResponseEntity<?> registerAdmin(@Valid @RequestBody Admin admin) {
        // 동일한 id가 이미 존재하는지 확인
        if(adminRepository.existsById(admin.getId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("해당 아이디의 관리자가 이미 존재합니다.");
        }

        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
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
