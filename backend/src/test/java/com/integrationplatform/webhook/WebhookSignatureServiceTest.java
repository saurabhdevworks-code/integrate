package com.integrationplatform.webhook;

import com.integrationplatform.webhook.service.WebhookSignatureService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class WebhookSignatureServiceTest {

    private WebhookSignatureService signatureService;
    private final String secret = "whsec_0123456789abcdef0123456789abcdef";
    private final String payload = "{\"event\":\"connection.created\",\"timestamp\":\"2026-11-02T10:00:00Z\"}";

    @BeforeEach
    void setUp() {
        signatureService = new WebhookSignatureService();
    }

    @Test
    void testGenerateAndVerifyValidSignature() {
        long now = Instant.now().getEpochSecond();
        String header = signatureService.generateHeader(secret, now, payload);

        assertNotNull(header);
        assertTrue(header.startsWith("t=" + now + ",v1="));

        boolean valid = signatureService.verifySignature(secret, header, payload);
        assertTrue(valid, "Valid signature header must be verified successfully");
    }

    @Test
    void testVerifyRejectsTamperedPayload() {
        long now = Instant.now().getEpochSecond();
        String header = signatureService.generateHeader(secret, now, payload);

        String tamperedPayload = "{\"event\":\"connection.created\",\"tampered\":true}";
        boolean valid = signatureService.verifySignature(secret, header, tamperedPayload);
        assertFalse(valid, "Tampered payload must be rejected");
    }

    @Test
    void testVerifyRejectsWrongSecret() {
        long now = Instant.now().getEpochSecond();
        String header = signatureService.generateHeader(secret, now, payload);

        String wrongSecret = "whsec_wrongsecret000000000000000000000000";
        boolean valid = signatureService.verifySignature(wrongSecret, header, payload);
        assertFalse(valid, "Signature verified with wrong secret must fail");
    }

    @Test
    void testVerifyRejectsExpiredTimestamp() {
        // Timestamp from 10 minutes ago
        long oldTimestamp = Instant.now().minusSeconds(600).getEpochSecond();
        String header = signatureService.generateHeader(secret, oldTimestamp, payload);

        // Default tolerance is 300 seconds (5 minutes)
        boolean valid = signatureService.verifySignature(secret, header, payload);
        assertFalse(valid, "Replay attack with expired timestamp must be rejected");
    }

    @Test
    void testVerifyHandlesMalformedHeaderSafely() {
        assertFalse(signatureService.verifySignature(secret, "invalid_header", payload));
        assertFalse(signatureService.verifySignature(secret, null, payload));
        assertFalse(signatureService.verifySignature(null, "t=123,v1=abc", payload));
        assertFalse(signatureService.verifySignature(secret, "t=123,v1=abc", null));
    }
}
