package com.hbs.hsbbo.common.util;

import com.hbs.hsbbo.admin.domain.entity.Admin;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {

    /**
     * 현재 로그인한 관리자 ID 반환
     * 로그인 안 되어 있으면 "anonymous" 반환
     */
    public static String getCurrentAdminId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getPrincipal() instanceof Admin) {
            Admin admin = (Admin) authentication.getPrincipal();
            return admin.getId();
        } else {
            return "anonymous";
        }
    }

    /**
     * 현재 로그인한 관리자 객체 반환
     * 로그인 안 되어 있으면 null 반환
     */
    public static Admin getCurrentAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getPrincipal() instanceof Admin) {
            return (Admin) authentication.getPrincipal();
        } else {
            return null;
        }
    }
}
