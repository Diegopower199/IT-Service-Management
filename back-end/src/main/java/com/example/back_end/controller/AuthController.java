package com.example.back_end.controller;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.back_end.dtos.auth.AuthLoginResponse;
import com.example.back_end.dtos.auth.AuthLoginResult;
import com.example.back_end.dtos.auth.LoginRequest;
import com.example.back_end.dtos.auth.RefreshTokenResponse;
import com.example.back_end.dtos.auth.RefreshTokenResult;
import com.example.back_end.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * REST controller that exposes authentication endpoints.
 *
 * <p>
 * The base route is {@code /auth}. Public authentication endpoints are
 * configured in {@code SecurityConfig}.
 * </p>
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${jwt.refresh-token-expiration-days}")
    private long refreshTokenExpirationDays;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    /**
     * Authenticates a user and creates an authenticated session.
     *
     * <p>
     * The access token is returned in the response body, while the refresh
     * token is stored in an HttpOnly cookie.
     * </p>
     *
     * @param request username and password
     * @return login response containing the access token, username, and role
     */
    @PostMapping("/login")
    public ResponseEntity<AuthLoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        AuthLoginResult result = authService.login(request);

        ResponseCookie refreshTokenCookie = createRefreshTokenCookie(
                result.getRefreshToken());

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.SET_COOKIE,
                        refreshTokenCookie.toString())
                .body(result.getAuthLoginResponse());
    }

    /**
     * Refreshes the authenticated session using the refresh token stored in
     * the HttpOnly cookie.
     *
     * <p>
     * If the refresh token is valid, it is rotated and a new access token is
     * generated. The new refresh token replaces the previous cookie.
     * </p>
     *
     * @param refreshToken refresh token received from the HttpOnly cookie
     * @return response containing the newly generated access token
     */
    @PostMapping("/refresh")
    public ResponseEntity<RefreshTokenResponse> refresh(
            @CookieValue(name = "refreshToken", required = false) String refreshToken) {

        RefreshTokenResult result = authService.refresh(refreshToken);

        ResponseCookie refreshTokenCookie = createRefreshTokenCookie(
                result.getRefreshToken());

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.SET_COOKIE,
                        refreshTokenCookie.toString())
                .body(result.getResponse());
    }

    /**
     * Logs out the current authenticated session.
     *
     * <p>
     * If a refresh token cookie is present, the corresponding refresh token is
     * revoked. The cookie is then removed from the client.
     * </p>
     *
     * @param refreshToken refresh token received from the HttpOnly cookie
     * @return an empty HTTP 204 response
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name = "refreshToken", required = false) String refreshToken) {

        if (StringUtils.hasText(refreshToken)) {
            authService.logout(refreshToken);
        }

        ResponseCookie expiredRefreshTokenCookie = createExpiredRefreshTokenCookie();

        return ResponseEntity.noContent()
                .header(
                        HttpHeaders.SET_COOKIE,
                        expiredRefreshTokenCookie.toString())
                .build();
    }

    /**
     * Creates the HttpOnly cookie used to store a refresh token.
     *
     * <p>
     * The cookie is restricted to authentication endpoints and its expiration
     * matches the configured refresh token lifetime.
     * </p>
     *
     * @param refreshToken refresh token to store in the cookie
     * @return configured refresh token cookie
     */
    private ResponseCookie createRefreshTokenCookie(
            String refreshToken) {

        return ResponseCookie.from(
                "refreshToken",
                refreshToken)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/api/v1/auth")
                .maxAge(Duration.ofDays(refreshTokenExpirationDays))
                .build();
    }

    /**
     * Creates an expired refresh token cookie so the client removes the existing
     * refresh token.
     *
     * @return expired refresh token cookie
     */
    private ResponseCookie createExpiredRefreshTokenCookie() {

        return ResponseCookie.from(
                "refreshToken",
                "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/api/v1/auth")
                .maxAge(Duration.ZERO)
                .build();
    }
}