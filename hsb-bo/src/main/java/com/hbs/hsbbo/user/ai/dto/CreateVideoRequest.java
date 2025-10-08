package com.hbs.hsbbo.user.ai.dto;

public record CreateVideoRequest(
        String prompt, String aspect, Integer durationSec, String resolution
) {}

