package com.hbs.hsbbo.user.ai.dto;

public record SoraGetResponse(
        String id,
        String status,
        String resultUrl,
        Integer progress
) {}

