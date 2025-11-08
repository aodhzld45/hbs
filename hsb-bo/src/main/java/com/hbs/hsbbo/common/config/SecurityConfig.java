package com.hbs.hsbbo.common.config;

import com.hbs.hsbbo.common.cors.CorsOriginProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorsOriginProvider corsOriginProvider;

    @Value("${app.cors.enabled:false}")
    private boolean corsEnabled;

    @Value("${app.cors.allowed-origins:}")
    private String allowedOriginsCsv;

    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
                // CORS: on/off (on일 때는 기본설정으로 활성화)
                //.cors(c -> {}) // 전역 CorsFilter가 처리하므로 켜두기만
                .cors(c -> c.configurationSource(corsConfigurationSource)) //  명시 바인딩

                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Preflight/HEAD 허용
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.HEAD, "/**").permitAll()

                        // 위젯/AI 공개 엔드포인트(인증 X)
                        .requestMatchers(
                                "/api/ai/ping",
                                "/api/ai/public/**",
                                "/api/ai/complete2"
                        ).permitAll()

                        // 공개 엔드포인트
                        .requestMatchers("/api/admin/login",
                                "/v3/api-docs/**","/swagger-ui/**","/swagger-ui.html",
                                "/api/v3/api-docs/**","/api/swagger-ui/**","/api/swagger-ui.html",  // /api 밑 경로 허용
                                "/files/**","/api/kis/**").permitAll()

                        // 관리자 API만 인증
                        .requestMatchers("/api/admin/**").authenticated()
                        .anyRequest().permitAll()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        if (!corsEnabled) return request -> null;

        return request -> {
            final String path = request.getRequestURI();
            if (!path.startsWith("/api/")) return null;

            final String origin = request.getHeader("Origin");
            if (origin == null) return null; // 브라우저 CORS 아님

            // 1) 기본: DB
            List<String> patterns = corsOriginProvider.getAllowedOriginPatterns(null);
            log.info("[CORS] DB patterns={}", patterns);

            // 2) yml 덮어쓰기 (값이 있을 때만)
            if (allowedOriginsCsv != null && !allowedOriginsCsv.isBlank()) {
                patterns = Arrays.stream(allowedOriginsCsv.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .distinct()
                        .collect(Collectors.toList());
            }

            if (patterns == null || patterns.isEmpty()) {
                log.info("[CORS] no patterns → deny. path={}, origin={}", path, origin);
                return null; // 헤더 미부착 → 브라우저에서 CORS 에러 발생
            }

            // 3) Spring의 검사 로직을 이용해 매칭 확인
            CorsConfiguration probe = new CorsConfiguration();
            probe.setAllowedOriginPatterns(patterns);
            String allowed = probe.checkOrigin(origin); // 매칭되면 origin/“*” 반환, 아니면 null

            if (allowed == null) {
                log.info("[CORS] origin not allowed. path={}, origin={}, patterns={}", path, origin, patterns);
                return null;
            }

            // 4) 실제 응답에는 “그 요청 origin만” 허용 (보수적)
            CorsConfiguration cfg = new CorsConfiguration();
            cfg.setAllowedOrigins(List.of(origin));      // ★ 요청 origin만 반영
            cfg.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","HEAD","OPTIONS"));
            cfg.setAllowedHeaders(List.of("*"));
            cfg.setExposedHeaders(List.of("X-DailyReq-Remaining","Content-Disposition"));
            cfg.setAllowCredentials(false);
            cfg.setMaxAge(1L);                           // ★ 테스트 중엔 캐시 최소화
            return cfg;
        };
    }
}
