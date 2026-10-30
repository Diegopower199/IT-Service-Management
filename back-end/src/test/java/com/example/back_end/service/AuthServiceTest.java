package com.example.back_end.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import com.example.back_end.dtos.auth.AuthLoginResult;
import com.example.back_end.dtos.auth.LoginRequest;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.DepartmentModel;
import com.example.back_end.model.RoleModel;
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

    @InjectMocks
    private AuthService authService;

    // =========================================================
    // LOGIN
    // =========================================================

    @Test
    void shouldLoginSuccessfully() {

        LoginRequest request = org.mockito.Mockito.mock(
                LoginRequest.class);

        when(request.getUsername())
                .thenReturn("ana");

        when(request.getPassword())
                .thenReturn("password123");

        RoleModel role = new RoleModel(
                3L,
                "USER");

        DepartmentModel department = new DepartmentModel(
                1L,
                "IT",
                true);

        UserModel user = new UserModel(
                1L,
                "ana",
                "ana@example.com",
                "encodedPassword",
                "Ana",
                "Garcia",
                true,
                role,
                department);

        when(userRepository.findByUsername("ana"))
                .thenReturn(
                        Optional.of(user));

        when(jwtService.getToken(user))
                .thenReturn(
                        "jwt-token");

        when(refreshTokenService
                .createRefreshToken(user))
                .thenReturn(
                        "refresh-token");

        AuthLoginResult result = authService.login(request);

        assertEquals(
                "jwt-token",
                result.getAuthLoginResponse()
                        .getToken());

        assertEquals(
                "ana",
                result.getAuthLoginResponse()
                        .getUsername());

        assertEquals(
                "USER",
                result.getAuthLoginResponse()
                        .getRole());

        assertEquals(
                "refresh-token",
                result.getRefreshToken());

        verify(authenticationManager)
                .authenticate(
                        any(
                                UsernamePasswordAuthenticationToken.class));

        verify(userRepository)
                .findByUsername("ana");

        verify(jwtService)
                .getToken(user);

        verify(refreshTokenService)
                .createRefreshToken(user);
    }

    @Test
    void shouldThrowExceptionWhenUserDoesNotExistAfterAuthentication() {

        LoginRequest request = org.mockito.Mockito.mock(
                LoginRequest.class);

        when(request.getUsername())
                .thenReturn("ana");

        when(request.getPassword())
                .thenReturn("password123");

        when(userRepository.findByUsername("ana"))
                .thenReturn(
                        Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> authService.login(request));

        verify(authenticationManager)
                .authenticate(
                        any(
                                UsernamePasswordAuthenticationToken.class));

        verify(userRepository)
                .findByUsername("ana");

        verify(jwtService, never())
                .getToken(any());

        verify(refreshTokenService, never())
                .createRefreshToken(any());
    }
}