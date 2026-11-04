package com.integrationplatform.usage.dto;

import java.util.List;
import java.util.UUID;

public record UsageSummaryResponse(
    UUID projectId,
    long totalExecutions,
    long successfulExecutions,
    long failedExecutions,
    double successRatePercent,
    double averageDurationMs,
    List<DailyUsageDto> dailyBreakdown
) {}
