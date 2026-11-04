package com.integrationplatform.usage.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.integrationplatform.common.exception.ErrorResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int DEFAULT_LIMIT_PER_MINUTE = 60;
    private final Map<String, WindowCounter> requestCounts = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/actuator")
            || path.startsWith("/swagger-ui")
            || path.startsWith("/v3/api-docs")
            || path.equals("/api/info")
            || "OPTIONS".equalsIgnoreCase(request.getMethod());
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        String clientKey = resolveClientKey(request);
        long currentMinute = Instant.now().getEpochSecond() / 60;

        WindowCounter counter = requestCounts.compute(clientKey, (key, existing) -> {
            if (existing == null || existing.minute != currentMinute) {
                return new WindowCounter(currentMinute, new AtomicInteger(1));
            }
            existing.count.incrementAndGet();
            return existing;
        });

        int currentCount = counter.count.get();
        int remaining = Math.max(0, DEFAULT_LIMIT_PER_MINUTE - currentCount);
        long secondsUntilReset = 60 - (Instant.now().getEpochSecond() % 60);

        response.setHeader("X-RateLimit-Limit", String.valueOf(DEFAULT_LIMIT_PER_MINUTE));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));

        if (currentCount > DEFAULT_LIMIT_PER_MINUTE) {
            response.setStatus(429);
            response.setHeader("Retry-After", String.valueOf(secondsUntilReset));
            response.setContentType("application/json");

            ErrorResponse err = ErrorResponse.of(
                429,
                "Too Many Requests",
                "Rate limit exceeded: maximum " + DEFAULT_LIMIT_PER_MINUTE + " requests per minute allowed.",
                request.getRequestURI()
            );
            response.getWriter().write(objectMapper.writeValueAsString(err));
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String resolveClientKey(HttpServletRequest request) {
        String apiKey = request.getHeader("X-API-Key");
        if (apiKey == null || apiKey.isBlank()) {
            apiKey = request.getHeader("X-Integration-Api-Key");
        }
        if (apiKey != null && !apiKey.isBlank()) {
            return "key:" + apiKey;
        }
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ip_")) {
            return "key:" + authHeader.substring(7);
        }
        String clientIp = request.getHeader("X-Forwarded-For");
        if (clientIp != null && !clientIp.isBlank()) {
            return "ip:" + clientIp.split(",")[0].trim();
        }
        return "ip:" + request.getRemoteAddr();
    }

    private static class WindowCounter {
        final long minute;
        final AtomicInteger count;

        WindowCounter(long minute, AtomicInteger count) {
            this.minute = minute;
            this.count = count;
        }
    }
}
