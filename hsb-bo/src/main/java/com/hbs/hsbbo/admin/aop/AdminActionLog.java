package com.hbs.hsbbo.admin.aop;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface AdminActionLog {
    /**
     * 수행한 액션명 (e.g. "메뉴 등록", "메뉴 삭제")
     */
    String action();

    /**
     * 로그 상세 메시지 템플릿
     *
     * e.g. "메뉴명={menuName}이 삭제됨"
     *
     * - {} 안의 키는 파라미터명 또는 반환값 필드명을 넣을 수 있음
     * - 값이 없으면 빈 문자열("")
     */
    String detail() default "";
}
