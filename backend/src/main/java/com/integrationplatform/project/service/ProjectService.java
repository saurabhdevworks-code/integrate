package com.integrationplatform.project.service;

import com.integrationplatform.audit.service.AuditService;
import com.integrationplatform.common.exception.ForbiddenException;
import com.integrationplatform.common.exception.ResourceNotFoundException;
import com.integrationplatform.organization.model.Organization;
import com.integrationplatform.organization.repository.OrganizationMemberRepository;
import com.integrationplatform.organization.repository.OrganizationRepository;
import com.integrationplatform.project.dto.CreateProjectRequest;
import com.integrationplatform.project.dto.ProjectResponse;
import com.integrationplatform.project.model.Project;
import com.integrationplatform.project.model.ProjectEnvironment;
import com.integrationplatform.project.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository memberRepository;
    private final AuditService auditService;

    public ProjectService(
        ProjectRepository projectRepository,
        OrganizationRepository organizationRepository,
        OrganizationMemberRepository memberRepository,
        AuditService auditService
    ) {
        this.projectRepository = projectRepository;
        this.organizationRepository = organizationRepository;
        this.memberRepository = memberRepository;
        this.auditService = auditService;
    }

    @Transactional
    public ProjectResponse createProject(UUID orgId, UUID userId, CreateProjectRequest request) {
        Organization org = organizationRepository.findById(orgId)
            .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        boolean isMember = memberRepository.existsByOrganizationIdAndUserId(orgId, userId);
        if (!isMember) {
            throw new ForbiddenException("You do not have permission to create projects in this organization");
        }

        String baseSlug = generateSlug(request.name());
        String slug = baseSlug;
        int counter = 1;
        while (projectRepository.existsByOrganizationIdAndSlug(orgId, slug)) {
            slug = baseSlug + "-" + counter++;
        }

        Project project = new Project(org, request.name().trim(), slug);

        // Add default environments
        ProjectEnvironment testEnv = new ProjectEnvironment(project, "TEST");
        ProjectEnvironment liveEnv = new ProjectEnvironment(project, "LIVE");
        project.getEnvironments().add(testEnv);
        project.getEnvironments().add(liveEnv);

        Project saved = projectRepository.save(project);

        auditService.record(
            userId,
            orgId,
            "project.created",
            "Project",
            saved.getId(),
            "{\"name\":\"" + saved.getName() + "\",\"slug\":\"" + saved.getSlug() + "\"}"
        );

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> listProjects(UUID orgId, UUID userId) {
        boolean isMember = memberRepository.existsByOrganizationIdAndUserId(orgId, userId);
        if (!isMember) {
            throw new ForbiddenException("You do not have access to this organization's projects");
        }

        return projectRepository.findByOrganizationId(orgId).stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProject(UUID projectId, UUID userId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        boolean isMember = memberRepository.existsByOrganizationIdAndUserId(project.getOrganization().getId(), userId);
        if (!isMember) {
            throw new ForbiddenException("You do not have access to this project");
        }

        return mapToResponse(project);
    }

    @Transactional(readOnly = true)
    public Project validateProjectAccess(UUID projectId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));

        org.springframework.security.core.Authentication auth =
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            if (auth.getPrincipal() instanceof com.integrationplatform.common.security.ApiKeyPrincipal apiKey) {
                if (!apiKey.getProjectId().equals(projectId)) {
                    throw new ForbiddenException("API key is not authorized for this project");
                }
            } else if (auth.getPrincipal() instanceof com.integrationplatform.common.security.UserPrincipal user) {
                boolean isMember = memberRepository.existsByOrganizationIdAndUserId(project.getOrganization().getId(), user.getId());
                if (!isMember) {
                    throw new ForbiddenException("You do not have access to this project");
                }
            }
        }
        return project;
    }

    private ProjectResponse mapToResponse(Project project) {
        List<String> envs = project.getEnvironments().stream()
            .map(ProjectEnvironment::getName)
            .toList();

        return new ProjectResponse(
            project.getId(),
            project.getOrganization().getId(),
            project.getName(),
            project.getSlug(),
            envs,
            project.getCreatedAt()
        );
    }

    private String generateSlug(String input) {
        if (input == null) return "proj";
        String normalized = input.trim().toLowerCase(Locale.ROOT)
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("\\s+", "-");
        return normalized.isEmpty() ? "proj" : (normalized.length() > 50 ? normalized.substring(0, 50) : normalized);
    }
}
