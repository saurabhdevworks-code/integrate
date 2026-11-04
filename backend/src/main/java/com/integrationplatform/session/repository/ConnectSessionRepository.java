package com.integrationplatform.session.repository;

import com.integrationplatform.session.model.ConnectSession;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConnectSessionRepository extends JpaRepository<ConnectSession, UUID> {

    @EntityGraph(attributePaths = {"project", "integration", "connectedAccount"})
    Optional<ConnectSession> findByIdAndProjectId(UUID id, UUID projectId);
}
