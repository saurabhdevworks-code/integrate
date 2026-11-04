package com.integrationplatform.webhook.service;

import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;

@Service
public class WebhookSignatureService {

    private static final String HMAC_SHA256 = "HmacSHA256";
    private static final long DEFAULT_TOLERANCE_SECONDS = 300; // 5 minutes

    /**
     * Signs payload according to industry standard format:
     * signature = HmacSHA256(timestamp + "." + payload, secret)
     * header value = "t=" + timestamp + ",v1=" + hexSignature
     */
    public String generateHeader(String secret, long timestamp, String payload) {
        String hexSig = computeHexSignature(secret, timestamp + "." + payload);
        return "t=" + timestamp + ",v1=" + hexSig;
    }

    public String computeHexSignature(String secret, String content) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
            mac.init(secretKey);
            byte[] rawHmac = mac.doFinal(content.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(rawHmac);
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate webhook HMAC signature", e);
        }
    }

    /**
     * Verifies that the provided signature header matches the secret and payload.
     * Uses constant-time comparison to prevent timing attacks.
     */
    public boolean verifySignature(String secret, String signatureHeader, String payload) {
        return verifySignature(secret, signatureHeader, payload, DEFAULT_TOLERANCE_SECONDS);
    }

    public boolean verifySignature(String secret, String signatureHeader, String payload, long toleranceSeconds) {
        if (secret == null || signatureHeader == null || payload == null) {
            return false;
        }

        try {
            Long timestamp = null;
            String receivedSig = null;

            String[] parts = signatureHeader.split(",");
            for (String part : parts) {
                String[] kv = part.split("=", 2);
                if (kv.length == 2) {
                    if ("t".equals(kv[0].trim())) {
                        timestamp = Long.parseLong(kv[1].trim());
                    } else if ("v1".equals(kv[0].trim())) {
                        receivedSig = kv[1].trim();
                    }
                }
            }

            if (timestamp == null || receivedSig == null) {
                return false;
            }

            // Check tolerance to prevent replay attacks
            long now = Instant.now().getEpochSecond();
            if (toleranceSeconds > 0 && Math.abs(now - timestamp) > toleranceSeconds) {
                return false;
            }

            String expectedSig = computeHexSignature(secret, timestamp + "." + payload);

            // Constant-time comparison
            return MessageDigest.isEqual(
                expectedSig.getBytes(StandardCharsets.UTF_8),
                receivedSig.getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            return false;
        }
    }
}
