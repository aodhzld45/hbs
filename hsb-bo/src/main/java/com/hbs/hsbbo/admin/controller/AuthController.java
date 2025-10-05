package com.hbs.hsbbo.admin.controller;

import com.hbs.hsbbo.admin.aop.AdminActionLog;
import com.hbs.hsbbo.admin.domain.entity.Admin;
import com.hbs.hsbbo.admin.domain.type.AdminStatus;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AuthController {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // 로그인 실패 카운트
    private static final int LOCK_THRESHOLD = 5;

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
            // 삭제/잠금 상태 가드
            if (Boolean.TRUE.equals(admin.getIsDeleted())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("삭제된 계정입니다.");
            }

            if (admin.getStatus() != null && admin.getStatus() == AdminStatus.LOCKED) {
                return ResponseEntity.status(423 /* Locked */).body("계정이 잠금 상태입니다. 관리자에게 문의하세요.");
            }

            // 비밀번호 검사
            if (!passwordEncoder.matches(loginRequest.getPassword(), admin.getPassword())) {
                // 실패 카운트 + 잠금처리
                int failCount = (admin.getAccessFailCount() == null ? 0 : admin.getAccessFailCount()) + 1;
                admin.setAccessFailCount(failCount);
                if (failCount >= LOCK_THRESHOLD) {
                    admin.setStatus(AdminStatus.LOCKED); // 계정 잠금처리.
                }

                admin.setUpdatedAt(LocalDateTime.now());
                admin.setUpdatedBy(admin.getId());
                adminRepository.save(admin);

                String msg = (admin.getStatus() == AdminStatus.LOCKED)
                        ? "비밀번호 오류가 누적되어 계정이 잠겼습니다."
                        : String.format("Login 실패 (남은 시도 가능 횟수 : %d)", Math.max(0,LOCK_THRESHOLD - failCount));
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(msg);
            }

            // 로그인 성공시 계정 정보 업데이트
            String ip = clientIp(request);
            String ua = Optional.ofNullable(request.getHeader("User-Agent")).orElse("");
            LocalDateTime now = LocalDateTime.now();
            admin.setLastLoginIp(ip);
            admin.setLastLoginDevice(ua);
            admin.setLoggedAt(now);
            admin.setAccessFailCount(0);
            admin.setStatus(AdminStatus.ACTIVE);
            admin.setUpdatedAt(now);
            admin.setUpdatedBy(admin.getId());

            adminRepository.save(admin);

            // JWT
            String token = jwtTokenProvider.createToken(admin.getId(), "ADMIN");

            // 권한도 함께 내려보냄
            List<String> roles = List.of("ROLE_ADMIN");

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("token", token);
            body.put("adminId", admin.getId());
            body.put("name", admin.getName());
            body.put("groupId", admin.getGroupId());
            body.put("tel", admin.getTel());                 // null 허용
            body.put("memo", admin.getMemo());               // null 허용
            body.put("email", admin.getEmail());
            body.put("roles", roles);
            body.put("status", admin.getStatus());
            body.put("loggedAt", admin.getLoggedAt());
            body.put("lastLoginIp", admin.getLastLoginIp());
            body.put("lastLoginDevice", admin.getLastLoginDevice());

            return ResponseEntity.ok(body);

        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login 실패");
        }
    }

    // 현재 로그인된 관리자 정보 반환 (JWT 인증 기반)
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentAdmin(Authentication authentication, HttpSession session) {
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

            // 세션 ID와 필요한 세션 속성들 가져오기
            String sessionId = session.getId();
            Map<String, Object> sessionAttrs = new HashMap<>();
            var attrNames = session.getAttributeNames();
            while (attrNames.hasMoreElements()) {
                String key = attrNames.nextElement();
                sessionAttrs.put(key, session.getAttribute(key));
            }

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("adminId", currentAdmin.getId());
            body.put("name", currentAdmin.getName());
            body.put("groupId", currentAdmin.getGroupId());
            body.put("tel", currentAdmin.getTel());                 // null 허용
            body.put("memo", currentAdmin.getMemo());               // null 허용
            body.put("email", currentAdmin.getEmail());
            body.put("roles", roles);
            body.put("status", currentAdmin.getStatus());
            body.put("loggedAt", currentAdmin.getLoggedAt());
            body.put("lastLoginIp", currentAdmin.getLastLoginIp());
            body.put("lastLoginDevice", currentAdmin.getLastLoginDevice());
            return ResponseEntity.ok(body);


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
    @AdminActionLog(
            action = "수정",
            detail = "관리자 계정 {id} 수정"
    )
    public ResponseEntity<?> updateAdmin(@PathVariable("id") String id,
                                         @RequestBody Admin updatedAdmin,
                                         @RequestParam(name = "actorId", required = false) String actorId
    ) {
        return adminRepository.findById(id)
                .map(admin -> {
                    // 1) 입력 정규화 (null-safe)
                    String newName  = Optional.ofNullable(updatedAdmin.getName()).map(String::trim).orElse(null);
                    String newEmail = Optional.ofNullable(updatedAdmin.getEmail()).map(s -> s.trim().toLowerCase()).orElse(null);
                    String newTel   = Optional.ofNullable(updatedAdmin.getTel()).map(String::trim).orElse(null);
                    String newMemo  = Optional.ofNullable(updatedAdmin.getMemo()).map(String::trim).orElse(null);
                    Integer newGroup = updatedAdmin.getGroupId();

                    // 2) 변경 의사가 있는 필드만 반영 + 유효성/중복 체크
                    if (newEmail != null) {
                        if (newEmail.isBlank()) {
                            return ResponseEntity.badRequest().body("이메일을 비울 수 없습니다.");
                        }
                        if (adminRepository.existsByEmailAndIdNot(newEmail, id)) {
                            return ResponseEntity.status(HttpStatus.CONFLICT)
                                    .body("해당 이메일의 관리자가 이미 존재합니다.");
                        }
                        admin.setEmail(newEmail);
                    }
                    if (newName != null)  admin.setName(newName);
                    if (newTel != null)   admin.setTel(newTel);
                    if (newMemo != null)  admin.setMemo(newMemo);
                    if (newGroup != null) admin.setGroupId(newGroup);

                    // 상태 변경 허용 (nullable이면 무시)
                    if (updatedAdmin.getStatus() != null) {
                        admin.setStatus(updatedAdmin.getStatus());
                    }

                    // 3) 비밀번호 처리(입력된 경우에만)
                    String rawPwd = updatedAdmin.getPassword();
                    if (rawPwd != null && !rawPwd.isBlank()) {
                        admin.setPasswordLength(rawPwd.length());
                        admin.setPassword(passwordEncoder.encode(rawPwd));
                        admin.setPasswordUpdatedAt(LocalDateTime.now());

                        // 선택: 비밀번호 변경 시 실패 카운트 초기화
                        admin.setAccessFailCount(0);
                    }

                    // 4) 서버 관리 필드 업데이트(감사/타임스탬프)
                    LocalDateTime now = LocalDateTime.now();
                    admin.setUpdatedAt(now);
                    String actor = (actorId != null && !actorId.isBlank())
                            ? actorId
                            : resolveActorFromSecurityContext().orElse("system");
                    admin.setUpdatedBy(actor);

                    // 5) 저장
                    Admin saved = adminRepository.save(admin);
                    return ResponseEntity.ok(saved);
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
    public ResponseEntity<?> registerAdmin(
            @Valid @RequestBody Admin admin,
            @RequestParam(name = "actorId", required = false) String actorId
    ) {
        // 1) 입력 정규화
        admin.setId(admin.getId().trim());
        admin.setEmail(admin.getEmail().trim().toLowerCase());
        admin.setName(admin.getName().trim());

        // 2) 중복 체크
        if (adminRepository.existsById(admin.getId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("해당 아이디의 관리자가 이미 존재합니다.");
        }
        if (adminRepository.existsByEmail(admin.getEmail())) { // 레포지토리에 추가 필요
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("해당 이메일의 관리자가 이미 존재합니다.");
        }

        // 3) 서버가 관리하는 필드 무시/초기화
        admin.setAccessFailCount(0);
        admin.setIsDeleted(Boolean.FALSE);
        admin.setDeletedAt(null);
        admin.setLoggedAt(null);
        admin.setLastLoginIp(null);
        admin.setLastLoginDevice(null);
        admin.setLastLoginLocation(null);

        // 상태 기본값 보정
        if (admin.getStatus() == null) admin.setStatus(AdminStatus.ACTIVE);

        // 생성/수정일
        LocalDateTime now = LocalDateTime.now();
        admin.setCreatedAt(now);
        admin.setUpdatedAt(now);
        admin.setPasswordUpdatedAt(now);

        // 감사자 (SecurityContext 있으면 반영)
        String actor = (actorId != null && !actorId.isBlank())
                ? actorId
                : resolveActorFromSecurityContext().orElse("system");
        admin.setCreatedBy(actor);
        admin.setUpdatedBy(actor);

        // 4) 비밀번호 해시
        if (admin.getPassword() == null || admin.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body("비밀번호를 입력해주세요.");
        }
        admin.setPasswordLength(admin.getPassword().length()); // 서버가 굳이 저장 안 하거나, 저장하려면 길이 세팅
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));

        // 5) 저장
        Admin saved = adminRepository.save(admin);

        // 6) 응답: 엔티티 그대로 보내도 password는 WRITE_ONLY라 숨겨짐
        URI location = URI.create("/api/admin/" + saved.getId());
        return ResponseEntity.created(location).body(saved);
    }

    private Optional<String> resolveActorFromSecurityContext() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof Admin a) {
            return Optional.ofNullable(a.getId());
        }
        return Optional.empty();
    }

    private String clientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();
        String real = request.getHeader("X-Real-IP");
        if (real != null && !real.isBlank()) return real.trim();
        return request.getRemoteAddr();
    }
}
