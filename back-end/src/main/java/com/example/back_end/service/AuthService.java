package com.example.back_end.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import com.example.back_end.dtos.auth.AuthLoginResponse;
import com.example.back_end.dtos.auth.AuthLoginResult;
import com.example.back_end.dtos.auth.LoginRequest;
import com.example.back_end.dtos.auth.RefreshTokenResponse;
import com.example.back_end.dtos.auth.RefreshTokenResult;
import com.example.back_end.dtos.auth.RefreshTokenRotationResult;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.UserModel;
import com.example.back_end.repository.UserRepository;
import com.example.back_end.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final AuthenticationManager authenticationManager;

    /**
     * Authenticates a user using their username and password.
     *
     * <p>
     * {@link AuthenticationManager} validates the provided credentials using
     * the AuthenticationProvider configured in {@code ApplicationConfig}.
     * If authentication fails, Spring throws an exception.
     * </p>
     *
     * <p>
     * If authentication succeeds, the user is retrieved and both an access
     * token and a refresh token are generated. The access token is included
     * in the API response, while the refresh token is returned internally so
     * it can later be stored in an HttpOnly cookie by the controller.
     * </p>
     *
     * @param request credentials received from the API
     * @return login result containing the API response and refresh token
     */
    public AuthLoginResult login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()));

        UserModel user = userRepository
                .findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found"));

        String accessToken = jwtService.getToken(user);

        String refreshToken = refreshTokenService.createRefreshToken(user);

        AuthLoginResponse authLoginResponse = new AuthLoginResponse(
                accessToken,
                user.getUsername(),
                user.getRole().getName());

        return new AuthLoginResult(
                authLoginResponse,
                refreshToken);
    }

    /**
     * Refreshes an authenticated user session using a valid refresh token.
     *
     * <p>
     * The current refresh token is validated and rotated. A new access token is
     * then generated for the user associated with the refresh token.
     * </p>
     *
     * <p>
     * The new access token is included in the API response, while the rotated
     * refresh token is returned internally so the controller can store it in an
     * HttpOnly cookie.
     * </p>
     *
     * @param refreshToken the current refresh token received from the client
     * @return result containing the new access token and rotated refresh token
     */
    public RefreshTokenResult refresh(
            String refreshToken) {

        RefreshTokenRotationResult rotationResult = refreshTokenService
                .rotateRefreshToken(refreshToken);

        String newAccessToken = jwtService.getToken(
                rotationResult.getUser());

        RefreshTokenResponse response = new RefreshTokenResponse(
                newAccessToken);

        return new RefreshTokenResult(
                response,
                rotationResult.getRefreshToken());
    }

    /**
     * Logs out the current user session by revoking its refresh token.
     *
     * <p>
     * Revoking the refresh token prevents it from being used to generate new
     * access tokens. The refresh token cookie is removed separately by the
     * controller.
     * </p>
     *
     * @param refreshToken the refresh token associated with the current session
     */
    public void logout(String refreshToken) {
        refreshTokenService.revokeRefreshToken(refreshToken);
    }
}