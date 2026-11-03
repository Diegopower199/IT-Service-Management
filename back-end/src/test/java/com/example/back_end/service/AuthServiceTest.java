package com.example.back_end.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

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

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private LoginRequest loginRequest;

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private UserModel user;

    @Mock
    private RefreshTokenRotationResult refreshTokenRotationResult;

    @InjectMocks
    private AuthService authService;

    @Test
    void loginShouldAuthenticateUserAndReturnTokens() {

        String username = "john";
        String password = "password";
        String accessToken = "access-token";
        String refreshToken = "refresh-token";
        String roleName = "USER";
        Long userId = 1L;

        when(loginRequest.getUsername())
                .thenReturn(username);

        when(loginRequest.getPassword())
                .thenReturn(password);

        when(userRepository.findByUsername(username))
                .thenReturn(Optional.of(user));

        when(user.getIdUser())
                .thenReturn(userId);

        when(user.getUsername())
                .thenReturn(username);

        when(user.getRole().getName())
                .thenReturn(roleName);

        when(jwtService.getToken(user))
                .thenReturn(accessToken);

        when(refreshTokenService.createRefreshToken(user))
                .thenReturn(refreshToken);

        AuthLoginResult result = authService.login(loginRequest);

        AuthLoginResponse expectedResponse = new AuthLoginResponse(
                accessToken,
                userId,
                username,
                roleName);

        assertThat(result)
                .isNotNull();

        assertThat(result.getAuthLoginResponse())
                .usingRecursiveComparison()
                .isEqualTo(expectedResponse);

        assertThat(result.getRefreshToken())
                .isEqualTo(refreshToken);

        ArgumentCaptor<UsernamePasswordAuthenticationToken> authenticationCaptor = ArgumentCaptor.forClass(
                UsernamePasswordAuthenticationToken.class);

        verify(authenticationManager)
                .authenticate(authenticationCaptor.capture());

        UsernamePasswordAuthenticationToken authentication = authenticationCaptor.getValue();

        assertThat(authentication.getPrincipal())
                .isEqualTo(username);

        assertThat(authentication.getCredentials())
                .isEqualTo(password);

        verify(userRepository).findByUsername(username);

        verify(jwtService).getToken(user);

        verify(refreshTokenService).createRefreshToken(user);
    }

    @Test
    void loginShouldThrowExceptionWhenAuthenticationFails() {

        String username = "john";
        String password = "wrong-password";

        when(loginRequest.getUsername())
                .thenReturn(username);

        when(loginRequest.getPassword())
                .thenReturn(password);

        when(authenticationManager.authenticate(
                any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException(
                        "Bad credentials"));

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class);

        verify(authenticationManager).authenticate(
                any(UsernamePasswordAuthenticationToken.class));

        verifyNoInteractions(
                userRepository,
                jwtService,
                refreshTokenService);
    }

    @Test
    void loginShouldThrowResourceNotFoundExceptionWhenUserDoesNotExist() {

        String username = "john";
        String password = "password";

        when(loginRequest.getUsername())
                .thenReturn(username);

        when(loginRequest.getPassword())
                .thenReturn(password);

        when(userRepository.findByUsername(username))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("User not found");

        verify(authenticationManager).authenticate(
                any(UsernamePasswordAuthenticationToken.class));

        verify(userRepository).findByUsername(username);

        verifyNoInteractions(
                jwtService,
                refreshTokenService);
    }

    @Test
    void refreshShouldRotateRefreshTokenAndGenerateNewAccessToken() {

        String oldRefreshToken = "old-refresh-token";
        String newRefreshToken = "new-refresh-token";
        String newAccessToken = "new-access-token";

        when(refreshTokenService.rotateRefreshToken(
                oldRefreshToken))
                .thenReturn(refreshTokenRotationResult);

        when(refreshTokenRotationResult.getUser())
                .thenReturn(user);

        when(refreshTokenRotationResult.getRefreshToken())
                .thenReturn(newRefreshToken);

        when(jwtService.getToken(user))
                .thenReturn(newAccessToken);

        RefreshTokenResult result = authService.refresh(oldRefreshToken);

        RefreshTokenResponse expectedResponse = new RefreshTokenResponse(newAccessToken);

        assertThat(result)
                .isNotNull();

        assertThat(result.getResponse())
                .usingRecursiveComparison()
                .isEqualTo(expectedResponse);

        assertThat(result.getRefreshToken())
                .isEqualTo(newRefreshToken);

        verify(refreshTokenService)
                .rotateRefreshToken(oldRefreshToken);

        verify(jwtService).getToken(user);
    }

    @Test
    void logoutShouldRevokeRefreshToken() {

        String refreshToken = "refresh-token";

        authService.logout(refreshToken);

        verify(refreshTokenService)
                .revokeRefreshToken(refreshToken);
    }
}