package com.integrationplatform.auth;

import com.integrationplatform.audit.service.AuditService;
import com.integrationplatform.auth.dto.AuthResponse;
import com.integrationplatform.auth.dto.LoginRequest;
import com.integrationplatform.auth.dto.SignupRequest;
import com.integrationplatform.auth.model.User;
import com.integrationplatform.auth.model.UserStatus;
import com.integrationplatform.auth.repository.UserRepository;
import com.integrationplatform.auth.service.AuthService;
import com.integrationplatform.common.exception.BadRequestException;
import com.integrationplatform.common.security.JwtService;
import com.integrationplatform.organization.dto.OrganizationResponse;
import com.integrationplatform.organization.model.MemberRole;
import com.integrationplatform.organization.service.OrganizationService;
import com.integrationplatform.project.dto.ProjectResponse;
import com.integrationplatform.project.service.ProjectService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private OrganizationService organizationService;

    @Mock
    private ProjectService projectService;

    @Mock
    private AuditService auditService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
            userRepository,
            passwordEncoder,
            jwtService,
            organizationService,
            projectService,
            auditService
        );
    }

    @Test
    void testSignup_Success() {
        SignupRequest request = new SignupRequest("dev@example.com", "SecretPass123!", "Acme Devs");

        when(userRepository.existsByEmailIgnoreCase("dev@example.com")).thenReturn(false);
        when(passwordEncoder.encode("SecretPass123!")).thenReturn("$2a$12$hashedPassword");

        User savedUser = new User("dev@example.com", "$2a$12$hashedPassword");
        UUID userId = UUID.randomUUID();
        savedUser.setId(userId);
        lenient().when(userRepository.save(any(User.class))).thenReturn(savedUser);
        lenient().when(userRepository.saveAndFlush(any(User.class))).thenReturn(savedUser);

        UUID orgId = UUID.randomUUID();
        OrganizationResponse orgResponse = new OrganizationResponse(orgId, "Acme Devs", "acme-devs", MemberRole.OWNER, Instant.now());
        when(organizationService.createOrganization(eq(userId), any())).thenReturn(orgResponse);

        ProjectResponse projectResponse = new ProjectResponse(UUID.randomUUID(), orgId, "Default Project", "default-project", List.of("TEST", "LIVE"), Instant.now());
        when(projectService.createProject(eq(orgId), eq(userId), any())).thenReturn(projectResponse);

        when(jwtService.generateToken(userId, "dev@example.com")).thenReturn("mock-jwt-token");

        AuthResponse response = authService.signup(request);

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.token());
        assertEquals("dev@example.com", response.email());
        assertEquals("Acme Devs", response.defaultOrganization().name());

        verify(userRepository).save(any(User.class));
        verify(organizationService).createOrganization(eq(userId), any());
        verify(projectService).createProject(eq(orgId), eq(userId), any());
    }

    @Test
    void testSignup_DuplicateEmailThrowsBadRequest() {
        SignupRequest request = new SignupRequest("existing@example.com", "SecretPass123!", "Org");
        when(userRepository.existsByEmailIgnoreCase("existing@example.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.signup(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void testLogin_Success() {
        LoginRequest request = new LoginRequest("dev@example.com", "Password123!");
        User user = new User("dev@example.com", "$2a$12$hash");
        user.setId(UUID.randomUUID());
        user.setStatus(UserStatus.ACTIVE);

        when(userRepository.findByEmailIgnoreCase("dev@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password123!", "$2a$12$hash")).thenReturn(true);
        when(jwtService.generateToken(user.getId(), "dev@example.com")).thenReturn("mock-login-token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock-login-token", response.token());
        assertEquals(user.getId(), response.userId());
    }

    @Test
    void testLogin_InvalidPasswordThrowsBadCredentials() {
        LoginRequest request = new LoginRequest("dev@example.com", "WrongPassword");
        User user = new User("dev@example.com", "$2a$12$hash");
        user.setId(UUID.randomUUID());

        when(userRepository.findByEmailIgnoreCase("dev@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword", "$2a$12$hash")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }
}
