package com.integrationplatform.organization.controller;

import com.integrationplatform.common.security.SecurityContextHelper;
import com.integrationplatform.organization.dto.AddMemberRequest;
import com.integrationplatform.organization.dto.CreateOrganizationRequest;
import com.integrationplatform.organization.dto.MemberResponse;
import com.integrationplatform.organization.dto.OrganizationResponse;
import com.integrationplatform.organization.service.OrganizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/organizations")
@Tag(name = "Organizations", description = "Organization and team member management")
public class OrganizationController {

    private final OrganizationService organizationService;
    private final SecurityContextHelper securityContextHelper;

    public OrganizationController(OrganizationService organizationService, SecurityContextHelper securityContextHelper) {
        this.organizationService = organizationService;
        this.securityContextHelper = securityContextHelper;
    }

    @PostMapping
    @Operation(summary = "Create a new organization")
    public ResponseEntity<OrganizationResponse> createOrganization(@Valid @RequestBody CreateOrganizationRequest request) {
        UUID userId = securityContextHelper.getCurrentUserId();
        OrganizationResponse response = organizationService.createOrganization(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "List all organizations the authenticated user belongs to")
    public ResponseEntity<List<OrganizationResponse>> listOrganizations() {
        UUID userId = securityContextHelper.getCurrentUserId();
        return ResponseEntity.ok(organizationService.listUserOrganizations(userId));
    }

    @GetMapping("/{orgId}")
    @Operation(summary = "Get organization details")
    public ResponseEntity<OrganizationResponse> getOrganization(@PathVariable UUID orgId) {
        UUID userId = securityContextHelper.getCurrentUserId();
        return ResponseEntity.ok(organizationService.getOrganization(orgId, userId));
    }

    @GetMapping("/{orgId}/members")
    @Operation(summary = "List all members of an organization")
    public ResponseEntity<List<MemberResponse>> listMembers(@PathVariable UUID orgId) {
        UUID userId = securityContextHelper.getCurrentUserId();
        return ResponseEntity.ok(organizationService.listMembers(orgId, userId));
    }

    @PostMapping("/{orgId}/members")
    @Operation(summary = "Add a member to an organization")
    public ResponseEntity<MemberResponse> addMember(
        @PathVariable UUID orgId,
        @Valid @RequestBody AddMemberRequest request
    ) {
        UUID userId = securityContextHelper.getCurrentUserId();
        MemberResponse response = organizationService.addMember(orgId, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
