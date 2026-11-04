package com.integrationplatform.oauth.repository;

import com.integrationplatform.oauth.model.OAuthState;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OAuthStateRepository extends JpaRepository<OAuthState, UUID> {

    @EntityGraph(attributePaths = {"project", "integration"})
    Optional<OAuthState> findByStateToken(String stateToken);
}
