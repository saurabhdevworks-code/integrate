package com.integrationplatform.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateProjectRequest(
    @NotBlank(message = "Project name is required")
    @Size(min = 2, max = 160, message = "Project name must be between 2 and 160 characters")
    String name
) {}
