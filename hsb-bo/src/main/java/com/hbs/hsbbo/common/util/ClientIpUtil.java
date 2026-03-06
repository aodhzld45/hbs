package com.hbs.hsbbo.common.util;

import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.springframework.util.StringUtils;

import java.net.InetAddress;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class ClientIpUtil {

    private static final Pattern IPV4 = Pattern.compile("^\\d{1,3}(?:\\.\\d{1,3}){3}$");
    private static final Pattern IPV4_WITH_PORT = Pattern.compile("^(\\d{1,3}(?:\\.\\d{1,3}){3}):(\\d{1,5})$");
    private static final Pattern BRACKETED_IPV6_WITH_PORT = Pattern.compile("^\\[([0-9a-fA-F:]+)]:(\\d{1,5})$");
    private static final Pattern IPV6 = Pattern.compile("^[0-9a-fA-F:]+$");

    public static String extractClientIp(HttpServletRequest request) {
        String xff = firstHeaderToken(request.getHeader("X-Forwarded-For"));
        String normalizedFromXff = normalizeIp(xff);
        if (normalizedFromXff != null) {
            return normalizedFromXff;
        }

        String normalizedFromReal = normalizeIp(request.getHeader("X-Real-IP"));
        if (normalizedFromReal != null) {
            return normalizedFromReal;
        }

        return normalizeIp(request.getRemoteAddr());
    }

    public static String normalizeIp(String rawIp) {
        if (!StringUtils.hasText(rawIp)) {
            return null;
        }

        String ip = rawIp.trim();
        if ("unknown".equalsIgnoreCase(ip)) {
            return null;
        }

        if (ip.startsWith("::ffff:")) {
            String mapped = ip.substring(7);
            if (IPV4.matcher(mapped).matches()) {
                ip = mapped;
            }
        }

        Matcher ipv4WithPort = IPV4_WITH_PORT.matcher(ip);
        if (ipv4WithPort.matches()) {
            ip = ipv4WithPort.group(1);
        }

        Matcher bracketedIpv6 = BRACKETED_IPV6_WITH_PORT.matcher(ip);
        if (bracketedIpv6.matches()) {
            ip = bracketedIpv6.group(1);
        } else if (ip.startsWith("[") && ip.endsWith("]")) {
            ip = ip.substring(1, ip.length() - 1);
        }

        int zoneIndex = ip.indexOf('%');
        if (zoneIndex > 0) {
            ip = ip.substring(0, zoneIndex);
        }

        if (!isNumericIp(ip)) {
            return null;
        }

        try {
            return InetAddress.getByName(ip).getHostAddress();
        } catch (Exception ignored) {
            return null;
        }
    }

    private static String firstHeaderToken(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        String[] tokens = value.split(",");
        if (tokens.length == 0) {
            return null;
        }
        return tokens[0].trim();
    }

    private static boolean isNumericIp(String ip) {
        return IPV4.matcher(ip).matches() || IPV6.matcher(ip).matches();
    }
}
