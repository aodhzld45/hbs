package com.hbs.hsbbo.admin.aop;

import java.lang.annotation.*;


@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface AdminActionLog {
    String action(); // 예: "CREATE", "UPDATE"
}