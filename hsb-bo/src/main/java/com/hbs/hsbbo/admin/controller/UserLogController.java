package com.hbs.hsbbo.admin.controller;

import com.hbs.hsbbo.admin.dto.request.UserLogRequest;
import com.hbs.hsbbo.admin.dto.response.UserLogResponse;
import com.hbs.hsbbo.admin.service.UserLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RequestMapping("/api/userlog")
@RestController
public class UserLogController {

    private final UserLogService userLogService;

    @PostMapping
    public ResponseEntity<UserLogResponse> saveLog(
            @RequestBody UserLogRequest request,
            HttpServletRequest httpRequest
            ) {

        // 공인 ip를 얻어오는 부분
        String clientIp = httpRequest.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isBlank()) {
            clientIp = httpRequest.getRemoteAddr(); // 프록시 없을 경우
        }

        UserLogResponse savedLog = userLogService.saveLog(request, clientIp);
        return ResponseEntity.ok(savedLog);
    }





}
