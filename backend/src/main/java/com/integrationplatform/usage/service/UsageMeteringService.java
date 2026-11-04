package com.integrationplatform.usage.service;

import com.integrationplatform.project.model.Project;
import com.integrationplatform.project.repository.ProjectRepository;
import com.integrationplatform.usage.dto.DailyUsageDto;
import com.integrationplatform.usage.dto.UsageSummaryResponse;
import com.integrationplatform.usage.model.UsageRecord;
import com.integrationplatform.usage.repository.UsageRecordRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class UsageMeteringService {

    private final UsageRecordRepository usageRecordRepository;
    private final ProjectRepository projectRepository;

    public UsageMeteringService(
        UsageRecordRepository usageRecordRepository,
        ProjectRepository projectRepository
    ) {
        this.usageRecordRepository = usageRecordRepository;
        this.projectRepository = projectRepository;
    }

    @Async
    @Transactional
    public void recordExecution(UUID projectId, boolean success, long durationMs) {
        LocalDate today = LocalDate.now();

        UsageRecord record = usageRecordRepository.findByProjectIdAndPeriodDate(projectId, today)
            .orElseGet(() -> {
                Project project = projectRepository.findById(projectId).orElse(null);
                if (project == null) {
                    return null;
                }
                return new UsageRecord(project, today);
            });

        if (record != null) {
            record.increment(success, durationMs);
            usageRecordRepository.save(record);
        }
    }

    @Transactional(readOnly = true)
    public UsageSummaryResponse getUsageSummary(UUID projectId, int days) {
        int windowDays = (days <= 0 || days > 90) ? 30 : days;
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(windowDays - 1);

        List<UsageRecord> records = usageRecordRepository
            .findByProjectIdAndPeriodDateBetweenOrderByPeriodDateAsc(projectId, startDate, endDate);

        long totalExec = 0;
        long totalSuccess = 0;
        long totalFailed = 0;
        long totalDuration = 0;

        List<DailyUsageDto> dailyList = new ArrayList<>();

        for (UsageRecord r : records) {
            totalExec += r.getExecutionsCount();
            totalSuccess += r.getSuccessfulCount();
            totalFailed += r.getFailedCount();
            totalDuration += r.getDurationMsTotal();

            double avgMs = r.getExecutionsCount() > 0
                ? (double) r.getDurationMsTotal() / r.getExecutionsCount()
                : 0.0;

            dailyList.add(new DailyUsageDto(
                r.getPeriodDate(),
                r.getExecutionsCount(),
                r.getSuccessfulCount(),
                r.getFailedCount(),
                r.getDurationMsTotal(),
                Math.round(avgMs * 100.0) / 100.0
            ));
        }

        double successRate = totalExec > 0 ? ((double) totalSuccess / totalExec) * 100.0 : 100.0;
        double overallAvgDuration = totalExec > 0 ? (double) totalDuration / totalExec : 0.0;

        return new UsageSummaryResponse(
            projectId,
            totalExec,
            totalSuccess,
            totalFailed,
            Math.round(successRate * 10.0) / 10.0,
            Math.round(overallAvgDuration * 10.0) / 10.0,
            dailyList
        );
    }
}
