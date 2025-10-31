package com.hbs.hsbbo.common.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

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
                .cors(c -> { if (!corsEnabled) c.disable(); })   // 프로퍼티로 on/off
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 프리플라이트/HEAD는 전부 허용(브라우저 사전요청)
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
        if (allowedOriginsCsv != null && !allowedOriginsCsv.isBlank()) {
            Arrays.stream(allowedOriginsCsv.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .forEach(cfg::addAllowedOrigin);
        } else {
            // 기본 허용 (운영 + 로컬)
            cfg.addAllowedOrigin("https://www.hsbs.kr");
            cfg.addAllowedOrigin("https://hsbs.kr");
            cfg.addAllowedOrigin("http://localhost:3000");
            cfg.addAllowedOrigin("http://localhost:8080");
        }
        cfg.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","HEAD","OPTIONS"));
        //cfg.setAllowedHeaders(List.of("*"));
        // 브라우저가 보내는 헤더 화이트리스트 (커스텀 헤더 포함)
        cfg.setAllowedHeaders(List.of(
                "Content-Type",
                "X-HSBS-Site-Key",
                "Accept",
                "Origin",
                "Referer",
                "User-Agent",
                "Authorization",
                "Accept-Language",
                "Cache-Control",
                "Pragma",
                "X-Requested-With"   // 일부 라이브러리 호환
        ));
        cfg.setExposedHeaders(List.of("X-DailyReq-Remaining", "Content-Disposition"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }
}
