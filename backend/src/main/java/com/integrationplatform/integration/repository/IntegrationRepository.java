package com.integrationplatform.integration.repository;

import com.integrationplatform.integration.model.Integration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface IntegrationRepository extends JpaRepository<Integration, UUID> {
    Optional<Integration> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
