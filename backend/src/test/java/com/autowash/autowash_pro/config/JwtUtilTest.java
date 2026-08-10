package com.autowash.autowash_pro.config;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class JwtUtilTest {

    @Mock
    private JwtProperties jwtProperties;

    @InjectMocks
    private JwtUtil jwtUtil;

    private final String secret = "MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTI="; // Valid 256-bit Base64 secret
    private final long expiration = 3600000; // 1 hour
    private final long refreshExpiration = 86400000; // 24 hours

    @BeforeEach
    void setUp() {
        lenient().when(jwtProperties.getSecret()).thenReturn(secret);
        lenient().when(jwtProperties.getExpiration()).thenReturn(expiration);
        lenient().when(jwtProperties.getRefreshExpiration()).thenReturn(refreshExpiration);
    }

    @Test
    void generateAccessToken_ShouldCreateValidToken() {
        String phone = "0987654321";
        String role = "CUSTOMER";

        String token = jwtUtil.generateAccessToken(phone, role);

        assertNotNull(token);
        assertTrue(jwtUtil.isTokenValid(token));
        assertEquals(phone, jwtUtil.extractPhone(token));
        assertEquals(role, jwtUtil.extractRole(token));
    }

    @Test
    void generateRefreshToken_ShouldCreateValidToken() {
        String phone = "0987654321";

        String token = jwtUtil.generateRefreshToken(phone);

        assertNotNull(token);
        assertTrue(jwtUtil.isTokenValid(token));
        assertEquals(phone, jwtUtil.extractPhone(token));
        assertNull(jwtUtil.extractRole(token));
    }

    @Test
    void isTokenValid_ShouldReturnFalse_WhenTokenIsMalformed() {
        String invalidToken = "invalid-token";
        assertFalse(jwtUtil.isTokenValid(invalidToken));
    }
}
