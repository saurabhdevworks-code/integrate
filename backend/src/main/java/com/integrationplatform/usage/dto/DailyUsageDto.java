package com.integrationplatform.usage.dto;

import java.time.LocalDate;

public record DailyUsageDto(
    LocalDate date,
    long executions,
    long successful,
    long failed,
    long totalDurationMs,
    double averageDurationMs
) {}
