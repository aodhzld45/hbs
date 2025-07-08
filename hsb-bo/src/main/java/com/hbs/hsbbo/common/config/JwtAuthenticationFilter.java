package com.hbs.hsbbo.common.config;

import com.hbs.hsbbo.admin.domain.entity.Admin;
import com.hbs.hsbbo.admin.repository.AdminRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * JWT 인증 필터
 * - 매 요청마다 실행됨 (OncePerRequestFilter)
 * - JWT가 유효하면 사용자 정보를 SecurityContext에 등록
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private AdminRepository adminRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // 1) 요청 헤더에서 JWT 추출
        String token = resolveToken(request);

        // 2) JWT가 존재하고 유효한 경우만 처리
        if (token != null && jwtTokenProvider.validateToken(token)) {
            // JWT의 subject로 저장된 adminId 추출
            String userId = jwtTokenProvider.getUserId(token);

            // JWT에 저장된 역할(role) 정보 추출
            String role = jwtTokenProvider.getRole(token);

            // DB에서 adminId로 Admin 엔티티 조회
            Admin admin = adminRepository.findById(userId).orElse(null);

            if (admin != null) {
                /**
                 * authorities (권한) 생성
                 *
                 * Spring Security에서 권한 체크(@PreAuthorize 등)를 하려면
                 * Authentication 객체에 권한 정보(authorities)가 있어야 한다.
                 *
                 * 예) "ROLE_ADMIN", "ROLE_MANAGER" 등
                 *
                 * JWT 토큰에 들어있던 role 값을 기반으로 SimpleGrantedAuthority를 생성.
                 * ROLE_ prefix를 붙이는 이유:
                 * - hasRole("ADMIN") 이라는 어노테이션은 실제로 "ROLE_ADMIN" 이라는 문자열을 검사하기 때문.
                 */
                List<SimpleGrantedAuthority> authorities =
                        List.of(new SimpleGrantedAuthority("ROLE_" + role));

                /**
                 * UsernamePasswordAuthenticationToken 생성
                 *
                 * principal → Admin 엔티티 자체
                 * credentials → null (패스워드 인증이 아니므로)
                 * authorities → 위에서 만든 권한 리스트
                 */
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(admin, null, authorities);

                /**
                 * 인증 객체에 요청 정보(details)를 추가
                 * - IP, 세션ID 등 다양한 정보가 포함됨
                 */
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                /**
                 * SecurityContext에 인증 정보 저장
                 * → 이후 Controller에서 @AuthenticationPrincipal, Authentication 등을 통해
                 *    Admin 엔티티와 권한 정보를 꺼내 쓸 수 있게 된다.
                 */
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        // 다음 필터 실행
        filterChain.doFilter(request, response);
    }

    /**
     * Authorization 헤더에서 Bearer 토큰 추출
     * 예) "Bearer eyJhbGciOiJIUzI1NiJ9..."
     */
    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");

        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}
