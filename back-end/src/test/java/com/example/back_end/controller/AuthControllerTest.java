package com.example.back_end.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import com.example.back_end.dtos.auth.AuthLoginResponse;
import com.example.back_end.dtos.auth.AuthLoginResult;
import com.example.back_end.dtos.auth.LoginRequest;
import com.example.back_end.dtos.auth.RefreshTokenResponse;
import com.example.back_end.dtos.auth.RefreshTokenResult;
import com.example.back_end.service.AuthService;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @Mock
    private AuthLoginResult authLoginResult;

    @Mock
    private AuthLoginResponse authLoginResponse;

    @Mock
    private RefreshTokenResult refreshTokenResult;

    @Mock
    private RefreshTokenResponse refreshTokenResponse;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {

        ReflectionTestUtils.setField(
                authController,
                "refreshTokenExpirationDays",
                7L);

        ReflectionTestUtils.setField(
                authController,
                "cookieSecure",
                false);
    }

    @Test
    void loginShouldReturnAuthResponseAndRefreshTokenCookie() {

        LoginRequest request = new LoginRequest();

        when(authService.login(request))
                .thenReturn(authLoginResult);

        when(authLoginResult.getRefreshToken())
                .thenReturn("refresh-token");

        when(authLoginResult.getAuthLoginResponse())
                .thenReturn(authLoginResponse);

        ResponseEntity<AuthLoginResponse> response = authController.login(request);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(authLoginResponse);

        String cookie = response.getHeaders()
                .getFirst(HttpHeaders.SET_COOKIE);

        assertThat(cookie)
                .isNotNull()
                .contains("refreshToken=refresh-token")
                .contains("Path=/api/v1/auth")
                .contains("Max-Age=604800")
                .contains("HttpOnly")
                .contains("SameSite=Strict");

        verify(authService).login(request);
    }

    @Test
    void refreshShouldReturnNewAccessTokenAndRotateRefreshTokenCookie() {

        String refreshToken = "old-refresh-token";

        when(authService.refresh(refreshToken))
                .thenReturn(refreshTokenResult);

        when(refreshTokenResult.getRefreshToken())
                .thenReturn("new-refresh-token");

        when(refreshTokenResult.getResponse())
                .thenReturn(refreshTokenResponse);

        ResponseEntity<RefreshTokenResponse> response = authController.refresh(refreshToken);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(response.getBody())
                .isSameAs(refreshTokenResponse);

        String cookie = response.getHeaders()
                .getFirst(HttpHeaders.SET_COOKIE);

        assertThat(cookie)
                .isNotNull()
                .contains("refreshToken=new-refresh-token")
                .contains("Path=/api/v1/auth")
                .contains("Max-Age=604800")
                .contains("HttpOnly")
                .contains("SameSite=Strict");

        verify(authService).refresh(refreshToken);
    }

    @Test
    void logoutShouldRevokeRefreshTokenAndExpireCookie() {

        String refreshToken = "refresh-token";

        ResponseEntity<Void> response = authController.logout(refreshToken);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.NO_CONTENT);

        assertThat(response.getBody())
                .isNull();

        String cookie = response.getHeaders()
                .getFirst(HttpHeaders.SET_COOKIE);

        assertThat(cookie)
                .isNotNull()
                .contains("refreshToken=")
                .contains("Path=/api/v1/auth")
                .contains("Max-Age=0")
                .contains("HttpOnly")
                .contains("SameSite=Strict");

        verify(authService).logout(refreshToken);
    }

    @Test
    void logoutShouldNotRevokeRefreshTokenWhenCookieIsMissing() {

        ResponseEntity<Void> response = authController.logout(null);

        assertThat(response.getStatusCode())
                .isEqualTo(HttpStatus.NO_CONTENT);

        assertThat(response.getBody())
                .isNull();

        String cookie = response.getHeaders()
                .getFirst(HttpHeaders.SET_COOKIE);

        assertThat(cookie)
                .isNotNull()
                .contains("refreshToken=")
                .contains("Path=/api/v1/auth")
                .contains("Max-Age=0")
                .contains("HttpOnly")
                .contains("SameSite=Strict");

        verify(authService, never()).logout(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void loginShouldCreateSecureCookieWhenCookieSecureIsEnabled() {

        ReflectionTestUtils.setField(
                authController,
                "cookieSecure",
                true);

        LoginRequest request = new LoginRequest();

        when(authService.login(request))
                .thenReturn(authLoginResult);

        when(authLoginResult.getRefreshToken())
                .thenReturn("refresh-token");

        when(authLoginResult.getAuthLoginResponse())
                .thenReturn(authLoginResponse);

        ResponseEntity<AuthLoginResponse> response = authController.login(request);

        String cookie = response.getHeaders()
                .getFirst(HttpHeaders.SET_COOKIE);

        assertThat(cookie)
                .isNotNull()
                .contains("Secure");

        verify(authService).login(request);
    }
}