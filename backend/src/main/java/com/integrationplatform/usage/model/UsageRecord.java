package com.integrationplatform.usage.model;

import com.integrationplatform.project.model.Project;
import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
    name = "usage_records",
    uniqueConstraints = @UniqueConstraint(name = "uq_usage_records_project_date", columnNames = {"project_id", "period_date"})
)
public class UsageRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "period_date", nullable = false)
    private LocalDate periodDate;

    @Column(name = "executions_count", nullable = false)
    private long executionsCount = 0;

    @Column(name = "successful_count", nullable = false)
    private long successfulCount = 0;

    @Column(name = "failed_count", nullable = false)
    private long failedCount = 0;

    @Column(name = "duration_ms_total", nullable = false)
    private long durationMsTotal = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public UsageRecord() {}

    public UsageRecord(Project project, LocalDate periodDate) {
        this.project = project;
        this.periodDate = periodDate;
        this.executionsCount = 0;
        this.successfulCount = 0;
        this.failedCount = 0;
        this.durationMsTotal = 0;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public void increment(boolean success, long durationMs) {
        this.executionsCount++;
        if (success) {
            this.successfulCount++;
        } else {
            this.failedCount++;
        }
        this.durationMsTotal += Math.max(0, durationMs);
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public LocalDate getPeriodDate() {
        return periodDate;
    }

    public void setPeriodDate(LocalDate periodDate) {
        this.periodDate = periodDate;
    }

    public long getExecutionsCount() {
        return executionsCount;
    }

    public long getSuccessfulCount() {
        return successfulCount;
    }

    public long getFailedCount() {
        return failedCount;
    }

    public long getDurationMsTotal() {
        return durationMsTotal;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
