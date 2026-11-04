package com.integrationplatform.vault.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Enterprise Credential Vault providing authenticated AES-256-GCM encryption.
 * In production, this can be backed by AWS KMS, GCP KMS, or HashiCorp Vault.
 */
@Service
public class CredentialVaultService {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH_BYTES = 12; // 96-bit IV
    private static final int GCM_TAG_LENGTH_BITS = 128; // 128-bit authentication tag

    private final SecretKey masterKey;
    private final SecureRandom secureRandom = new SecureRandom();

    public CredentialVaultService(
        @Value("${app.vault.master-key:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef}") String masterKeyHex
    ) {
        byte[] keyBytes = parseKey(masterKeyHex);
        this.masterKey = new SecretKeySpec(keyBytes, "AES");
    }

    public String encrypt(String plaintext) {
        if (plaintext == null) {
            return null;
        }

        try {
            byte[] iv = new byte[GCM_IV_LENGTH_BYTES];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.ENCRYPT_MODE, masterKey, spec);

            byte[] cipherText = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

            // Combine IV and cipherText into a single payload
            ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + cipherText.length);
            byteBuffer.put(iv);
            byteBuffer.put(cipherText);

            return Base64.getEncoder().encodeToString(byteBuffer.array());
        } catch (Exception e) {
            throw new IllegalStateException("Failed to encrypt sensitive credential", e);
        }
    }

    public String decrypt(String encryptedPayload) {
        if (encryptedPayload == null) {
            return null;
        }

        try {
            byte[] decoded = Base64.getDecoder().decode(encryptedPayload);
            if (decoded.length < GCM_IV_LENGTH_BYTES) {
                throw new IllegalArgumentException("Encrypted payload too short");
            }

            ByteBuffer byteBuffer = ByteBuffer.wrap(decoded);
            byte[] iv = new byte[GCM_IV_LENGTH_BYTES];
            byteBuffer.get(iv);

            byte[] cipherText = new byte[byteBuffer.remaining()];
            byteBuffer.get(cipherText);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv);
            cipher.init(Cipher.DECRYPT_MODE, masterKey, spec);

            byte[] plainText = cipher.doFinal(cipherText);
            return new String(plainText, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to decrypt sensitive credential (tampered payload or invalid key)", e);
        }
    }

    private byte[] parseKey(String keyString) {
        String clean = keyString.trim();
        if (clean.length() == 64) {
            return HexFormat.of().parseHex(clean);
        }
        byte[] bytes = clean.getBytes(StandardCharsets.UTF_8);
        if (bytes.length == 32) {
            return bytes;
        }
        // Pad or truncate to 32 bytes safely
        byte[] key = new byte[32];
        System.arraycopy(bytes, 0, key, 0, Math.min(bytes.length, 32));
        return key;
    }
}
