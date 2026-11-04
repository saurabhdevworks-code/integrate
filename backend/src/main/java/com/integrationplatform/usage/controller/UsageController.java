package com.integrationplatform.usage.controller;

import com.integrationplatform.project.service.ProjectService;
import com.integrationplatform.usage.dto.UsageSummaryResponse;
import com.integrationplatform.usage.service.UsageMeteringService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/projects/{projectId}/usage")
@Tag(name = "Usage & Analytics", description = "Endpoints for usage metrics and rate limiting analytics")
public class UsageController {

    private final UsageMeteringService usageMeteringService;
    private final ProjectService projectService;

    public UsageController(
        UsageMeteringService usageMeteringService,
        ProjectService projectService
    ) {
        this.usageMeteringService = usageMeteringService;
        this.projectService = projectService;
    }

    @GetMapping
    @Operation(summary = "Get aggregated execution usage metrics for a project")
    public ResponseEntity<UsageSummaryResponse> getProjectUsage(
        @PathVariable UUID projectId,
        @RequestParam(defaultValue = "30") int days
    ) {
        projectService.validateProjectAccess(projectId);
        return ResponseEntity.ok(usageMeteringService.getUsageSummary(projectId, days));
    }
}
