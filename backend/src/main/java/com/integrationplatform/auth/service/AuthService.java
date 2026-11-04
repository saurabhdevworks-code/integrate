package com.integrationplatform.auth.service;

import com.integrationplatform.audit.service.AuditService;
import com.integrationplatform.auth.dto.AuthResponse;
import com.integrationplatform.auth.dto.LoginRequest;
import com.integrationplatform.auth.dto.SignupRequest;
import com.integrationplatform.auth.dto.UserProfileResponse;
import com.integrationplatform.auth.model.User;
import com.integrationplatform.auth.model.UserStatus;
import com.integrationplatform.auth.repository.UserRepository;
import com.integrationplatform.common.exception.BadRequestException;
import com.integrationplatform.common.exception.ResourceNotFoundException;
import com.integrationplatform.common.security.JwtService;
import com.integrationplatform.organization.dto.CreateOrganizationRequest;
import com.integrationplatform.organization.dto.OrganizationResponse;
import com.integrationplatform.organization.service.OrganizationService;
import com.integrationplatform.project.dto.CreateProjectRequest;
import com.integrationplatform.project.service.ProjectService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OrganizationService organizationService;
    private final ProjectService projectService;
    private final AuditService auditService;

    public AuthService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService,
        OrganizationService organizationService,
        ProjectService projectService,
        AuditService auditService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.organizationService = organizationService;
        this.projectService = projectService;
        this.auditService = auditService;
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("An account with this email address already exists");
        }

        String passwordHash = passwordEncoder.encode(request.password());
        User user = new User(email, passwordHash);
        user.setStatus(UserStatus.ACTIVE);
        User savedUser = userRepository.saveAndFlush(user);

        // Auto-create initial organization
        String orgName = StringUtils.hasText(request.organizationName())
            ? request.organizationName().trim()
            : email.split("@")[0] + "'s Organization";

        OrganizationResponse org = organizationService.createOrganization(
            savedUser.getId(),
            new CreateOrganizationRequest(orgName)
        );

        // Auto-create initial project for frictionless onboarding
        projectService.createProject(org.id(), savedUser.getId(), new CreateProjectRequest("Default Project"));

        auditService.record(
            savedUser.getId(),
            org.id(),
            "user.signup",
            "User",
            savedUser.getId(),
            "{\"email\":\"" + savedUser.getEmail() + "\"}"
        );

        String token = jwtService.generateToken(savedUser.getId(), savedUser.getEmail());

        return new AuthResponse(token, savedUser.getId(), savedUser.getEmail(), org);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new BadRequestException("Your account has been suspended. Please contact support.");
        }

        List<OrganizationResponse> userOrgs = organizationService.listUserOrganizations(user.getId());
        OrganizationResponse defaultOrg = userOrgs.isEmpty() ? null : userOrgs.get(0);

        String token = jwtService.generateToken(user.getId(), user.getEmail());

        return new AuthResponse(token, user.getId(), user.getEmail(), defaultOrg);
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return new UserProfileResponse(user.getId(), user.getEmail(), user.getStatus(), user.getCreatedAt());
    }
}
