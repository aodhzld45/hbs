package com.hbs.hsbbo.admin.aop;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hbs.hsbbo.admin.domain.entity.Admin;
import com.hbs.hsbbo.admin.domain.entity.AdminLog;
import com.hbs.hsbbo.admin.service.AdminLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 관리자 활동 로그 기록을 위한 AOP Aspect 클래스
 *
 * - @AdminActionLog 어노테이션이 붙은 메서드 실행 후 동작
 * - 관리자의 ID, URL, IP, 파라미터 등을 admin_log 테이블에 저장
 */
@Aspect
@Component
public class AdminLogAspect {

    @Autowired
    private AdminLogService adminLogService;

    @Autowired
    private HttpServletRequest request;

    /**
     * @AfterReturning Advice
     *
     * - @AdminActionLog 어노테이션이 붙은 메서드가 정상적으로 실행된 후 수행
     * - 메서드의 인자값, 요청 정보 등을 기반으로 AdminLog 엔티티를 생성하고 저장
     *
     * @param joinPoint       호출된 메서드의 정보 (메서드명, 파라미터 등)
     * @param adminActionLog  어노테이션 자체 (annotation.action() 으로 액션명을 꺼낼 수 있다)
     * @param result          실제 Controller 메서드의 반환값
     */
    @AfterReturning(value = "@annotation(adminActionLog)", returning = "result")
    public void logAdminAction(JoinPoint joinPoint,
                               AdminActionLog adminActionLog,
                               Object result) {

        // 1. SecurityContext에서 현재 로그인된 Admin 객체 가져오기
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Admin admin = null;

        if (authentication != null && authentication.getPrincipal() instanceof Admin) {
            admin = (Admin) authentication.getPrincipal();
        }

        // 로그인되어 있지 않다면 anonymous로 처리
        String adminId = (admin != null) ? admin.getId() : "anonymous";

        // 2. 요청 URL 추출
        String url = request.getRequestURI();

        // 3. 메서드 호출 시 전달된 파라미터들을 JSON으로 직렬화
        Object[] args = joinPoint.getArgs();

        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(com.fasterxml.jackson.databind.SerializationFeature.FAIL_ON_EMPTY_BEANS, false);

        List<Object> serializableArgs = new ArrayList<>();
        for (Object arg : args) {
            if (arg == null) {
                serializableArgs.add(null);
            } else {
                if (
                        arg instanceof HttpServletRequest ||
                                arg instanceof jakarta.servlet.ServletResponse ||
                                arg instanceof org.springframework.validation.BindingResult ||
                                arg instanceof org.springframework.web.multipart.MultipartFile
                ) {
                    continue;
                }
                serializableArgs.add(arg);
            }
        }

        String paramsJson = "";
        try {
            paramsJson = mapper.writeValueAsString(serializableArgs);
        } catch (Exception e) {
            paramsJson = "JSON 변환 실패: " + e.getMessage();
        }

        // 4. 클라이언트 IP 추출 (프록시 환경도 고려)
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) {
            ip = request.getRemoteAddr();
        }

        // 5. AdminLog 엔티티 생성 및 값 세팅
        AdminLog log = new AdminLog();
        log.setAdminId(adminId);                         // 관리자 ID
        log.setAction(adminActionLog.action());          // 어노테이션에 설정한 액션명
        log.setUrl(url);                                 // 호출된 URL
        log.setParams(paramsJson);                       // 파라미터 JSON
        log.setIp(ip);                                   // 접속 IP
        log.setLogDate(LocalDateTime.now());             // 로그 생성 시각
        log.setRegAdm(adminId);                          // 등록자 ID
        log.setRegDate(LocalDateTime.now());             // 등록 시각

        // 6. 로그 저장 (DB insert)
        adminLogService.save(log);
    }
}
