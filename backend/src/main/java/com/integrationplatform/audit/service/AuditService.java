package com.integrationplatform.audit.service;

import com.integrationplatform.audit.model.AuditLog;
import com.integrationplatform.audit.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);
    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void record(UUID actorUserId, UUID organizationId, String action, String resourceType, UUID resourceId, String metadata) {
        try {
            AuditLog auditEntry = new AuditLog(actorUserId, organizationId, action, resourceType, resourceId, metadata);
            auditLogRepository.save(auditEntry);
        } catch (Exception ex) {
            log.warn("Non-fatal: Failed to write audit log for {}: {}", action, ex.getMessage());
        }
    }
}
