package com.integrationplatform.usage;

import com.integrationplatform.organization.model.Organization;
import com.integrationplatform.project.model.Project;
import com.integrationplatform.project.repository.ProjectRepository;
import com.integrationplatform.usage.dto.UsageSummaryResponse;
import com.integrationplatform.usage.model.UsageRecord;
import com.integrationplatform.usage.repository.UsageRecordRepository;
import com.integrationplatform.usage.service.UsageMeteringService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsageMeteringServiceTest {

    @Mock
    private UsageRecordRepository usageRecordRepository;

    @Mock
    private ProjectRepository projectRepository;

    private UsageMeteringService usageMeteringService;
    private Project testProject;
    private UUID projectId;

    @BeforeEach
    void setUp() {
        usageMeteringService = new UsageMeteringService(usageRecordRepository, projectRepository);

        Organization org = new Organization("Acme Corp", "acme-corp");
        testProject = new Project(org, "Analytics Project", "analytics-project");
        testProject.setId(UUID.randomUUID());
        projectId = testProject.getId();
    }

    @Test
    void testRecordExecution_IncrementsExistingDailyRecord() {
        LocalDate today = LocalDate.now();
        UsageRecord existingRecord = new UsageRecord(testProject, today);
        existingRecord.increment(true, 100);

        when(usageRecordRepository.findByProjectIdAndPeriodDate(projectId, today))
            .thenReturn(Optional.of(existingRecord));

        usageMeteringService.recordExecution(projectId, true, 200);

        assertEquals(2, existingRecord.getExecutionsCount());
        assertEquals(2, existingRecord.getSuccessfulCount());
        assertEquals(0, existingRecord.getFailedCount());
        assertEquals(300, existingRecord.getDurationMsTotal());

        verify(usageRecordRepository).save(existingRecord);
    }

    @Test
    void testRecordExecution_CreatesNewDailyRecordIfNotPresent() {
        LocalDate today = LocalDate.now();
        when(usageRecordRepository.findByProjectIdAndPeriodDate(projectId, today))
            .thenReturn(Optional.empty());
        when(projectRepository.findById(projectId))
            .thenReturn(Optional.of(testProject));

        usageMeteringService.recordExecution(projectId, false, 50);

        verify(usageRecordRepository).save(any(UsageRecord.class));
    }

    @Test
    void testGetUsageSummary_CalculatesAccurateAggregates() {
        LocalDate today = LocalDate.now();
        UsageRecord r1 = new UsageRecord(testProject, today.minusDays(1));
        r1.increment(true, 150);
        r1.increment(false, 50);

        UsageRecord r2 = new UsageRecord(testProject, today);
        r2.increment(true, 200);

        when(usageRecordRepository.findByProjectIdAndPeriodDateBetweenOrderByPeriodDateAsc(
            eq(projectId), any(LocalDate.class), any(LocalDate.class)
        )).thenReturn(List.of(r1, r2));

        UsageSummaryResponse summary = usageMeteringService.getUsageSummary(projectId, 7);

        assertNotNull(summary);
        assertEquals(projectId, summary.projectId());
        assertEquals(3, summary.totalExecutions());
        assertEquals(2, summary.successfulExecutions());
        assertEquals(1, summary.failedExecutions());
        assertEquals(66.7, summary.successRatePercent());
        assertEquals(133.3, summary.averageDurationMs());
        assertEquals(2, summary.dailyBreakdown().size());
    }
}
