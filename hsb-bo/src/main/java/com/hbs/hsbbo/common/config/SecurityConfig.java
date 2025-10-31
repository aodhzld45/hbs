package com.hbs.hsbbo.common.config;

import lombok.RequiredArgsConstructor;
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
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

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
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CORS: on/off (on일 때는 기본설정으로 활성화)
                .cors(c -> {}) // 전역 CorsFilter가 처리하므로 켜두기만
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
        if (!corsEnabled) return req -> null;
        CorsConfiguration cfg = new CorsConfiguration();

        // 1) 허용 Origin(패턴) 구성
        List<String> defaults = List.of(
                "https://www.hsbs.kr",
                "https://hsbs.kr",
                "http://localhost:3000",
                "http://localhost:5173",
                "http://localhost:5500",
                "http://127.0.0.1:5500",
                "http://localhost:8080",
                "http://localhost:8081"
        );

        List<String> fromProp = (allowedOriginsCsv == null || allowedOriginsCsv.isBlank())
                ? defaults
                : Arrays.stream(allowedOriginsCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());

        // 패턴 기반으로 허용(정확 매칭도 OK)
        cfg.setAllowedOriginPatterns(fromProp);

        // 2) 메서드/헤더
        cfg.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","HEAD","OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setExposedHeaders(List.of("X-DailyReq-Remaining", "Content-Disposition"));

        // 3) 공개 API(위젯)는 크리덴셜 불필요 → false 권장
        //    (관리자 콘솔은 동일 오리진이므로 CORS와 무관)
        cfg.setAllowCredentials(false);

        cfg.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        // API 경로에만 CORS 적용
        src.registerCorsConfiguration("/api/**", cfg);
        return src;

    }
}
