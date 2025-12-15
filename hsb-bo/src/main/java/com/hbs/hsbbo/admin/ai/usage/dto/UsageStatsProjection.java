package com.hbs.hsbbo.admin.ai.usage.dto;

import java.time.LocalDate;

public interface UsageStatsProjection {
    String getBucketLabel();
    LocalDate getBucketDate();

    Long getTotalCalls();
    Long getSuccessCalls();
    Long getFailCalls();

    Long getTotalPromptTokens();
    Long getTotalCompletionTokens();
    Long getTotalTokens();

    Double getAvgLatencyMs();
}
