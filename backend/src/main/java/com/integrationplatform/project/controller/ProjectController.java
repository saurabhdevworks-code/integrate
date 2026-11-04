package com.integrationplatform.project.controller;

import com.integrationplatform.common.security.SecurityContextHelper;
import com.integrationplatform.project.dto.CreateProjectRequest;
import com.integrationplatform.project.dto.ProjectResponse;
import com.integrationplatform.project.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@Tag(name = "Projects", description = "Project creation and scoping within organizations")
public class ProjectController {

    private final ProjectService projectService;
    private final SecurityContextHelper securityContextHelper;

    public ProjectController(ProjectService projectService, SecurityContextHelper securityContextHelper) {
        this.projectService = projectService;
        this.securityContextHelper = securityContextHelper;
    }

    @PostMapping("/organizations/{orgId}/projects")
    @Operation(summary = "Create a new project under an organization")
    public ResponseEntity<ProjectResponse> createProject(
        @PathVariable UUID orgId,
        @Valid @RequestBody CreateProjectRequest request
    ) {
        UUID userId = securityContextHelper.getCurrentUserId();
        ProjectResponse response = projectService.createProject(orgId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/organizations/{orgId}/projects")
    @Operation(summary = "List all projects under an organization")
    public ResponseEntity<List<ProjectResponse>> listProjects(@PathVariable UUID orgId) {
        UUID userId = securityContextHelper.getCurrentUserId();
        return ResponseEntity.ok(projectService.listProjects(orgId, userId));
    }

    @GetMapping("/projects/{projectId}")
    @Operation(summary = "Get project details by ID")
    public ResponseEntity<ProjectResponse> getProject(@PathVariable UUID projectId) {
        UUID userId = securityContextHelper.getCurrentUserId();
        return ResponseEntity.ok(projectService.getProject(projectId, userId));
    }
}
