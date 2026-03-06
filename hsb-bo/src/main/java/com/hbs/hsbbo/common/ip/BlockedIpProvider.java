package com.hbs.hsbbo.common.ip;

public interface BlockedIpProvider {
    boolean isBlocked(String ipAddress);
}
