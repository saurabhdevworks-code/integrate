package com.integrationplatform.execution.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.integrationplatform.common.exception.ForbiddenException;
import com.integrationplatform.common.exception.ResourceNotFoundException;
import com.integrationplatform.execution.dto.ToolDefinitionResponse;
import com.integrationplatform.execution.model.ToolDefinition;
import com.integrationplatform.execution.repository.ToolDefinitionRepository;
import com.integrationplatform.organization.repository.OrganizationMemberRepository;
import com.integrationplatform.project.model.Project;
import com.integrationplatform.project.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ToolRegistryService {

    private final ToolDefinitionRepository toolDefinitionRepository;
    private final ProjectRepository projectRepository;
    private final OrganizationMemberRepository memberRepository;
    private final ObjectMapper objectMapper;

    public ToolRegistryService(
        ToolDefinitionRepository toolDefinitionRepository,
        ProjectRepository projectRepository,
        OrganizationMemberRepository memberRepository,
        ObjectMapper objectMapper
    ) {
        this.toolDefinitionRepository = toolDefinitionRepository;
        this.projectRepository = projectRepository;
        this.memberRepository = memberRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<ToolDefinitionResponse> listToolsForProject(UUID projectId, UUID userId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        if (userId != null && !memberRepository.existsByOrganizationIdAndUserId(project.getOrganization().getId(), userId)) {
            throw new ForbiddenException("You do not have access to this project");
        }

        return toolDefinitionRepository.findAll().stream()
            .map(this::mapToResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public ToolDefinitionResponse getToolBySlug(String slug) {
        ToolDefinition tool = toolDefinitionRepository.findBySlug(slug.trim().toLowerCase())
            .orElseThrow(() -> new ResourceNotFoundException("Tool definition not found with slug: " + slug));

        return mapToResponse(tool);
    }

    private ToolDefinitionResponse mapToResponse(ToolDefinition tool) {
        JsonNode schemaNode = null;
        try {
            schemaNode = objectMapper.readTree(tool.getInputSchema());
        } catch (Exception ignored) {}

        return new ToolDefinitionResponse(
            tool.getId(),
            tool.getIntegration().getSlug(),
            tool.getIntegration().getName(),
            tool.getSlug(),
            tool.getName(),
            tool.getDescription(),
            schemaNode,
            tool.getRequiredScopes(),
            tool.getRiskLevel(),
            tool.isRequiresApproval(),
            tool.getVersion()
        );
    }
}
