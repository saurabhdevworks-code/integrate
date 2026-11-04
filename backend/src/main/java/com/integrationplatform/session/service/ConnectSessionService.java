package com.integrationplatform.session.service;

import com.integrationplatform.common.exception.ResourceNotFoundException;
import com.integrationplatform.integration.model.Integration;
import com.integrationplatform.integration.repository.IntegrationRepository;
import com.integrationplatform.oauth.dto.InitiateOAuthRequest;
import com.integrationplatform.oauth.dto.OAuthInitiateResponse;
import com.integrationplatform.oauth.service.OAuthEngineService;
import com.integrationplatform.project.model.Project;
import com.integrationplatform.project.repository.ProjectRepository;
import com.integrationplatform.session.dto.ConnectSessionResponse;
import com.integrationplatform.session.dto.CreateSessionRequest;
import com.integrationplatform.session.model.ConnectSession;
import com.integrationplatform.session.repository.ConnectSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class ConnectSessionService {

    private final ConnectSessionRepository sessionRepository;
    private final ProjectRepository projectRepository;
    private final IntegrationRepository integrationRepository;
    private final OAuthEngineService oauthEngineService;

    public ConnectSessionService(
        ConnectSessionRepository sessionRepository,
        ProjectRepository projectRepository,
        IntegrationRepository integrationRepository,
        OAuthEngineService oauthEngineService
    ) {
        this.sessionRepository = sessionRepository;
        this.projectRepository = projectRepository;
        this.integrationRepository = integrationRepository;
        this.oauthEngineService = oauthEngineService;
    }

    @Transactional
    public ConnectSessionResponse createSession(UUID projectId, CreateSessionRequest request) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        Integration integration = integrationRepository.findBySlug(request.integrationSlug().toLowerCase())
            .orElseThrow(() -> new ResourceNotFoundException("Integration not found: " + request.integrationSlug()));

        // Initiate OAuth flow through the central engine
        OAuthInitiateResponse oauthRes = oauthEngineService.initiateOAuthFlow(
            projectId,
            new InitiateOAuthRequest(integration.getSlug(), request.projectUserId(), null)
        );

        Instant expiresAt = Instant.now().plus(30, ChronoUnit.MINUTES);

        ConnectSession session = new ConnectSession(
            project,
            integration,
            request.projectUserId().trim(),
            request.returnUrl(),
            oauthRes.authorizationUrl(),
            expiresAt
        );
        ConnectSession saved = sessionRepository.save(session);

        return new ConnectSessionResponse(
            saved.getId(),
            integration.getSlug(),
            saved.getProjectUserId(),
            saved.getAuthUrl(),
            saved.getStatus(),
            saved.getReturnUrl(),
            saved.getConnectedAccount() != null ? saved.getConnectedAccount().getId() : null,
            saved.getExpiresAt(),
            saved.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public ConnectSessionResponse getSession(UUID sessionId, UUID projectId) {
        ConnectSession session = sessionRepository.findByIdAndProjectId(sessionId, projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Connect session not found: " + sessionId));

        return new ConnectSessionResponse(
            session.getId(),
            session.getIntegration().getSlug(),
            session.getProjectUserId(),
            session.getAuthUrl(),
            session.getStatus(),
            session.getReturnUrl(),
            session.getConnectedAccount() != null ? session.getConnectedAccount().getId() : null,
            session.getExpiresAt(),
            session.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public ConnectSession getPublicSession(UUID sessionId) {
        return sessionRepository.findById(sessionId)
            .orElseThrow(() -> new ResourceNotFoundException("Connect session not found: " + sessionId));
    }
}
