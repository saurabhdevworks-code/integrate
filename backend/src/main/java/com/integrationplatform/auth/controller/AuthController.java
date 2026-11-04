package com.integrationplatform.auth.controller;

import com.integrationplatform.auth.dto.AuthResponse;
import com.integrationplatform.auth.dto.LoginRequest;
import com.integrationplatform.auth.dto.SignupRequest;
import com.integrationplatform.auth.dto.UserProfileResponse;
import com.integrationplatform.auth.service.AuthService;
import com.integrationplatform.common.security.SecurityContextHelper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "User registration, login, and profile")
public class AuthController {

    private final AuthService authService;
    private final SecurityContextHelper securityContextHelper;

    public AuthController(AuthService authService, SecurityContextHelper securityContextHelper) {
        this.authService = authService;
        this.securityContextHelper = securityContextHelper;
    }

    @PostMapping("/signup")
    @Operation(summary = "Register a new developer account and organization")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        AuthResponse response = authService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Log in with email and password")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<UserProfileResponse> me() {
        UUID userId = securityContextHelper.getCurrentUserId();
        UserProfileResponse response = authService.getProfile(userId);
        return ResponseEntity.ok(response);
    }
}
