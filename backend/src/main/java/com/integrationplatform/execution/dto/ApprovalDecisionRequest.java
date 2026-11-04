package com.integrationplatform.execution.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ApprovalDecisionRequest(
    @NotBlank(message = "Decision is required")
    @Pattern(regexp = "^(APPROVE|REJECT)$", message = "Decision must be APPROVE or REJECT")
    String decision,

    String reason
) {}
