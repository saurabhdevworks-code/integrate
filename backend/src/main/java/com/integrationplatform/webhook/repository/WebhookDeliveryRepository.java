package com.integrationplatform.webhook.repository;

import com.integrationplatform.webhook.model.WebhookDelivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WebhookDeliveryRepository extends JpaRepository<WebhookDelivery, UUID> {
    List<WebhookDelivery> findByProjectIdOrderByCreatedAtDesc(UUID projectId);
    List<WebhookDelivery> findByWebhookIdOrderByCreatedAtDesc(UUID webhookId);
}
