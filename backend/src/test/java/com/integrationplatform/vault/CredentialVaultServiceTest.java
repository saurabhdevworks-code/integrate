package com.integrationplatform.vault;

import com.integrationplatform.vault.service.CredentialVaultService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class CredentialVaultServiceTest {

    private CredentialVaultService vaultService;

    @BeforeEach
    void setUp() {
        // 32 bytes hex key
        String masterKey = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
        vaultService = new CredentialVaultService(masterKey);
    }

    @Test
    void testEncryptAndDecrypt_Success() {
        String secretToken = "ya29.a0AfH6SMA873kjasndfkj-refresh-token-example";
        String encrypted = vaultService.encrypt(secretToken);

        assertNotNull(encrypted);
        assertNotEquals(secretToken, encrypted);

        String decrypted = vaultService.decrypt(encrypted);
        assertEquals(secretToken, decrypted);
    }

    @Test
    void testRandomIV_ProducesUniqueCiphertexts() {
        String token = "constant-secret-token";
        String enc1 = vaultService.encrypt(token);
        String enc2 = vaultService.encrypt(token);

        // Due to fresh random 12-byte IV for every encryption, ciphertexts must differ
        assertNotEquals(enc1, enc2);

        // Both decrypt to the same original token
        assertEquals(token, vaultService.decrypt(enc1));
        assertEquals(token, vaultService.decrypt(enc2));
    }

    @Test
    void testTamperedPayload_FailsDecryption() {
        String encrypted = vaultService.encrypt("secret-data");
        byte[] decoded = Base64.getDecoder().decode(encrypted);

        // Tamper with the last byte (authentication tag)
        decoded[decoded.length - 1] ^= 0x01;
        String tampered = Base64.getEncoder().encodeToString(decoded);

        assertThrows(IllegalStateException.class, () -> vaultService.decrypt(tampered));
    }

    @Test
    void testNullHandling() {
        assertNull(vaultService.encrypt(null));
        assertNull(vaultService.decrypt(null));
    }
}
