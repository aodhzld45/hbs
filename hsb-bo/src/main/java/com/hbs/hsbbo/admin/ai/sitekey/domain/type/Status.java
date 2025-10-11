package com.hbs.hsbbo.admin.ai.sitekey.domain.type;

import java.util.Locale;

public enum Status {
    ACTIVE,
    SUSPENDED,
    REVOKED;

    public static Status parseOrDefault(String s, Status def) {
        if (s == null || s.isBlank()) return def;
        try {
            return Status.valueOf(s.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return def; // 엄격 모드면 여기서 throw
        }
    }
}
