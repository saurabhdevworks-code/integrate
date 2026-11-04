package com.integrationplatform.webhook.repository;

import com.integrationplatform.webhook.model.Webhook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WebhookRepository extends JpaRepository<Webhook, UUID> {
    List<Webhook> findByProjectId(UUID projectId);
    List<Webhook> findByProjectIdAndIsActiveTrue(UUID projectId);
    Optional<Webhook> findByIdAndProjectId(UUID id, UUID projectId);
}
