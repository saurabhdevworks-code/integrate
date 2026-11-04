package com.integrationplatform.usage.repository;

import com.integrationplatform.usage.model.UsageRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UsageRecordRepository extends JpaRepository<UsageRecord, UUID> {
    Optional<UsageRecord> findByProjectIdAndPeriodDate(UUID projectId, LocalDate periodDate);
    List<UsageRecord> findByProjectIdAndPeriodDateBetweenOrderByPeriodDateAsc(
        UUID projectId,
        LocalDate startDate,
        LocalDate endDate
    );
}
