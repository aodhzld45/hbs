package com.hbs.hsbbo.admin.aop;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.hbs.hsbbo.admin.domain.entity.AdminLog;
import com.hbs.hsbbo.admin.dto.request.LoginRequest;
import com.hbs.hsbbo.admin.service.AdminLogService;
import com.hbs.hsbbo.common.util.SecurityUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.*;

/**
 * 관리자 활동 로그 기록 AOP Aspect 클래스
 *
 * - @AdminActionLog 어노테이션이 붙은 Controller 메서드가 정상적으로 실행된 이후 동작
 * - 관리자의 ID, URL, IP, 파라미터, 상세 이력(detail) 등을 admin_log 테이블에 기록
 */
@Aspect
@Component
public class AdminLogAspect {

    @Autowired
    private AdminLogService adminLogService;

    @Autowired
    private HttpServletRequest request;

    /**
     * AfterReturning Advice
     *
     * - @AdminActionLog 어노테이션이 붙은 메서드가 정상 수행 후 호출됨
     * - 메서드 파라미터, 리턴값, 요청 정보 등을 이용하여 AdminLog 엔티티를 생성
     *
     * @param joinPoint        호출된 메서드의 정보 (메서드명, 파라미터 값 등)
     * @param adminActionLog   어노테이션 인스턴스 (action(), detail() 값 사용)
     * @param result           실제 Controller 메서드의 반환값
     */
    @AfterReturning(value = "@annotation(adminActionLog)", returning = "result")
    public void logAdminAction(JoinPoint joinPoint,
                               AdminActionLog adminActionLog,
                               Object result) {
        // 1. 요청 URL 추출
        String url = request.getRequestURI();

        // 로그인 API의 경우 SecurityContext에 아직 인증 정보가 없으므로
        // 파라미터 LoginRequest에서 직접 id를 추출하도록 분기 처리
        String adminId;
        if ("/api/admin/login".equals(url)) {
            adminId = extractLoginId(joinPoint);
        } else {
            adminId = SecurityUtil.getCurrentAdminId();
        }

        // 조회 action 중복 체크 (AOP만 수정)
        if ("조회".equals(adminActionLog.action())) {
            boolean exists = adminLogService.existsRecentLog(
                    adminId, adminActionLog.action(), url, 60
            );
            if (exists) {
                // 최근 동일 로그 있으면 insert 안함
                return;
            }
        }

        // 2. 메서드 파라미터를 Map<String, Object>로 추출
        Map<String, Object> paramMap = extractParamMap(joinPoint);

        // 3. 반환 객체(result)가 ResponseEntity인 경우:
        //    → ResponseEntity의 body를 꺼내서 필드 정보를 Map에 추가
        //    → 그렇지 않으면 result 자체를 DTO로 간주하고 필드 정보를 추출
        if (result != null) {
            if (result instanceof org.springframework.http.ResponseEntity<?> responseEntity) {
                Object body = responseEntity.getBody();
                if (body != null) {
                    Map<String, Object> resultMap = extractFields(body);
                    paramMap.putAll(resultMap);
                }
            } else {
                Map<String, Object> resultMap = extractFields(result);
                paramMap.putAll(resultMap);
            }
        }

        // 4. 어노테이션에 명시된 detail 템플릿 치환
        String detailTemplate = adminActionLog.detail();
        String detail = applyTemplate(detailTemplate, paramMap);

        // 5. 메서드 호출 시 전달된 파라미터 전체를 JSON으로 직렬화 (로그 보관용)
        String paramsJson = serializeArguments(joinPoint);

        // 6. 실제 클라이언트 IP 추출 (프록시 환경 고려)
        String ip = getClientIp();

        // 7. AdminLog 엔티티 생성 및 세팅
        AdminLog log = new AdminLog();
        log.setAdminId(adminId);                    // 관리자 ID
        log.setAction(adminActionLog.action());     // 어노테이션에 설정한 액션명
        log.setDetail(detail);                      // 상세 이력
        log.setUrl(url);                            // 요청 URL
        log.setParams(paramsJson);                  // JSON으로 직렬화된 파라미터
        log.setIp(ip);                              // 접속 IP
        log.setLogDate(LocalDateTime.now());        // 로그 시각
        log.setRegAdm(adminId);                     // 등록자 ID
        log.setRegDate(LocalDateTime.now());        // 등록 시각

        // 8. 로그 저장 (DB Insert)
        adminLogService.save(log);
    }

    /**
     * 로그인 API의 경우 SecurityContext에 아직 인증 정보가 없으므로
     * JoinPoint에서 LoginRequest 파라미터를 찾아 id를 꺼내옴
     *
     * @param joinPoint 메서드 호출 정보
     * @return 로그인 시도한 adminId (없으면 "anonymous")
     */
    private String extractLoginId(JoinPoint joinPoint) {
        Object[] args = joinPoint.getArgs();
        for (Object arg : args) {
            if (arg instanceof LoginRequest loginRequest) {
                return loginRequest.getId();
            }
        }
        return "anonymous";
    }

    /**
     * JoinPoint로부터 메서드 파라미터명을 가져와 Map으로 변환
     *
     * e.g.
     *   @RequestBody MenuRequest dto
     * → dto.menuName → paramMap.put("menuName", "대시보드")
     *
     * @param joinPoint 메서드 호출 정보
     * @return 파라미터명-값 Map
     */
    private Map<String, Object> extractParamMap(JoinPoint joinPoint) {
        Map<String, Object> paramMap = new HashMap<>();
        Object[] args = joinPoint.getArgs();

        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String[] paramNames = signature.getParameterNames();

        for (int i = 0; i < args.length; i++) {
            Object arg = args[i];
            String paramName = paramNames[i];

            if (arg == null) {
                paramMap.put(paramName, null);
                continue;
            }

            //  Map<String, ?> 파라미터는 key-value를 풀어헤쳐 paramMap에 바로 넣음
            if (arg instanceof Map<?, ?> mapArg) {
                for (Map.Entry<?, ?> entry : mapArg.entrySet()) {
                    paramMap.put(String.valueOf(entry.getKey()), entry.getValue());
                }
            }
            //  단순 값은 그대로 paramMap에 기록
            else if (isPrimitiveOrWrapper(arg.getClass()) || arg instanceof String) {
                paramMap.put(paramName, arg);
            }
            //  DTO나 엔티티는 필드 단위로 풀어서 paramMap에 추가
            else {
                Map<String, Object> fields = extractFields(arg);
                paramMap.putAll(fields);
            }
        }

        //  request attribute(logArgs)도 paramMap에 추가
        Object logArgs = request.getAttribute("logArgs");
        if (logArgs != null && logArgs instanceof Map<?, ?> logMap) {
            for (Map.Entry<?, ?> entry : logMap.entrySet()) {
                paramMap.put(String.valueOf(entry.getKey()), entry.getValue());
            }
        }

        return paramMap;
    }

    /**
     * 객체의 모든 필드를 Map<String, Object>로 추출
     *
     * e.g.
     *   AdminMenu(id=1, menuName="대시보드")
     * → {id=1, menuName="대시보드"}
     *
     * 주의:
     * - JDK 컬렉션, Map, 배열 등은 reflection 대신 toString()으로 처리
     * - JDK 내부 클래스 (java.*)는 reflection 하지 않음
     *
     * @param obj DTO 또는 Entity
     * @return 필드명-값 Map
     */
    private Map<String, Object> extractFields(Object obj) {
        Map<String, Object> result = new HashMap<>();
        if (obj == null) return result;

        Class<?> clazz = obj.getClass();

        // JDK 컬렉션, Map, 배열, java.* 클래스는 reflection 하지 않고 문자열로 처리
        if (obj instanceof Collection || obj instanceof Map || clazz.isArray()
                || clazz.getPackageName().startsWith("java.")) {
            result.put(clazz.getSimpleName(), String.valueOf(obj));
            return result;
        }

        // Hibernate Proxy 클래스일 경우 실제 Entity 클래스로 치환
        if (clazz.getName().contains("HibernateProxy")) {
            clazz = clazz.getSuperclass();
        }

        for (Field field : clazz.getDeclaredFields()) {
            field.setAccessible(true);
            try {
                Object value = field.get(obj);
                result.put(field.getName(), value);
            } catch (IllegalAccessException ignored) {
            }
        }
        return result;
    }

    /**
     * 템플릿 문자열을 실제 값으로 치환
     *
     * e.g.
     *   템플릿: "메뉴명={menuName} 삭제됨"
     *   paramMap: {menuName=대시보드}
     * → 결과: "메뉴명=대시보드 삭제됨"
     *
     * @param template 템플릿 문자열
     * @param paramMap 파라미터 Map
     * @return 치환된 detail 문자열
     */
    private String applyTemplate(String template, Map<String, Object> paramMap) {
        String result = template;
        for (Map.Entry<String, Object> entry : paramMap.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();
            result = result.replace("{" + key + "}", String.valueOf(value));
        }
        return result;
    }

    /**
     * 메서드 파라미터 전체를 JSON 문자열로 직렬화
     *
     * - 보안을 위해 비밀번호 등은 마스킹 처리
     * - 직렬화가 불가능한 빈 객체의 경우 예외 방지
     *
     * @param joinPoint 메서드 호출 정보
     * @return 직렬화된 JSON 문자열
     */
    private String serializeArguments(JoinPoint joinPoint) {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        mapper.configure(com.fasterxml.jackson.databind.SerializationFeature.FAIL_ON_EMPTY_BEANS, false);

        List<Object> serializableArgs = new ArrayList<>();
        Object[] args = joinPoint.getArgs();

        for (Object arg : args) {
            if (arg == null) {
                serializableArgs.add(null);
                continue;
            }

            // 직렬화 제외 대상 (Servlet 객체, BindingResult 등)
            if (
                    arg instanceof HttpServletRequest ||
                            arg instanceof jakarta.servlet.ServletResponse ||
                            arg instanceof org.springframework.validation.BindingResult ||
                            arg instanceof org.springframework.web.multipart.MultipartFile
            ) {
                continue;
            }

            // LoginRequest인 경우 비밀번호 마스킹
            if (arg instanceof LoginRequest loginRequest) {
                if (loginRequest.getPassword() != null) {
                    loginRequest.setPassword("*****");
                }
            }

            serializableArgs.add(arg);
        }

        try {
            return mapper.writeValueAsString(serializableArgs);
        } catch (Exception e) {
            return "JSON 변환 실패: " + e.getMessage();
        }
    }

    /**
     * 프록시 환경 (Load Balancer 등)을 고려하여 클라이언트 IP를 추출
     *
     * - X-Forwarded-For 헤더 우선 사용
     * - 없으면 request.getRemoteAddr() 사용
     *
     * @return 클라이언트 IP
     */
    private String getClientIp() {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }

    /**
     * Wrapper 타입 여부 확인
     *
     * @param clazz 클래스 타입
     * @return Wrapper 여부 true/false
     */
    private boolean isPrimitiveOrWrapper(Class<?> clazz) {
        return clazz.isPrimitive()
                || clazz == Integer.class
                || clazz == Long.class
                || clazz == Boolean.class
                || clazz == Double.class
                || clazz == Float.class
                || clazz == Short.class
                || clazz == Byte.class
                || clazz == Character.class;
    }
}
