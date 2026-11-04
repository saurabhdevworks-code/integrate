package com.integrationplatform.common.security;

import com.integrationplatform.apikey.model.ApiKey;
import com.integrationplatform.apikey.service.ApiKeyService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {

    private final ApiKeyService apiKeyService;

    public ApiKeyAuthenticationFilter(ApiKeyService apiKeyService) {
        this.apiKeyService = apiKeyService;
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        String apiKeyHeader = extractApiKey(request);

        if (StringUtils.hasText(apiKeyHeader) && SecurityContextHolder.getContext().getAuthentication() == null) {
            Optional<ApiKey> apiKeyOpt = apiKeyService.authenticate(apiKeyHeader);
            if (apiKeyOpt.isPresent()) {
                ApiKeyPrincipal principal = new ApiKeyPrincipal(apiKeyOpt.get());
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    principal,
                    null,
                    principal.getAuthorities()
                );
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractApiKey(HttpServletRequest request) {
        String key = request.getHeader("X-API-Key");
        if (!StringUtils.hasText(key)) {
            key = request.getHeader("X-Integration-Api-Key");
        }
        if (StringUtils.hasText(key)) {
            return key.trim();
        }

        String authHeader = request.getHeader("Authorization");
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            if (token.startsWith("ip_live_") || token.startsWith("ip_test_") || token.startsWith("pk_live_") || token.startsWith("pk_test_")) {
                return token;
            }
        }
        return null;
    }
}
