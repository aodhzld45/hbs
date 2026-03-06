package com.hbs.hsbbo.common.config;

import com.hbs.hsbbo.common.ip.BlockedIpProvider;
import com.hbs.hsbbo.common.util.ClientIpUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
@Slf4j
public class BlockIpFilter extends OncePerRequestFilter {

    private final BlockedIpProvider blockedIpProvider;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String clientIp = ClientIpUtil.extractClientIp(request);
        if (clientIp != null && blockedIpProvider.isBlocked(clientIp)) {
            log.warn("Blocked request by IP. ip={}, method={}, uri={}", clientIp, request.getMethod(), request.getRequestURI());
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("{\"code\":\"FORBIDDEN\",\"message\":\"Access denied from blocked IP.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
