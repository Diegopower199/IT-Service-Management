package com.example.back_end.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.back_end.config.SecurityConfig;
import com.example.back_end.dtos.auth.AuthResponse;
import com.example.back_end.dtos.auth.LoginRequest;
import com.example.back_end.dtos.auth.RegisterRequest;
import com.example.back_end.security.JwtAuthenticationFilter;
import com.example.back_end.security.JwtService;
import com.example.back_end.service.AuthService;

@WebMvcTest(AuthController.class)
@Import({
        SecurityConfig.class,
        JwtAuthenticationFilter.class
})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @MockitoBean
    private AuthenticationProvider authenticationProvider;

    // =========================================================
    // LOGIN
    // =========================================================
    @Test
    void shouldLoginSuccessfully()
            throws Exception {

        AuthResponse response = new AuthResponse(
                "jwt-token");

        when(authService.login(
                any(LoginRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                post("/api/v1/auth/login")
                        .servletPath("/api/v1")
                        .contentType(
                                MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "username": "ana",
                                    "password": "password123"
                                }
                                """))
                .andExpect(
                        status().isOk())
                .andExpect(
                        jsonPath("$.token")
                                .value("jwt-token"));

        verify(authService)
                .login(
                        any(LoginRequest.class));
    }

    // =========================================================
    // REGISTER
    // =========================================================
    @Test
    void shouldRegisterSuccessfully()
            throws Exception {

        AuthResponse response = new AuthResponse(
                "jwt-token");

        when(authService.register(
                any(RegisterRequest.class)))
                .thenReturn(response);

        mockMvc.perform(
                post("/api/v1/auth/register")
                        .servletPath("/api/v1")
                        .contentType(
                                MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "username": "ana",
                                    "email": "ana@example.com",
                                    "password": "password123",
                                    "firstName": "Ana",
                                    "lastName": "Garcia",
                                    "rol": 3,
                                    "department": 1
                                }
                                """))
                .andExpect(
                        status().isOk())
                .andExpect(
                        jsonPath("$.token")
                                .value("jwt-token"));

        verify(authService)
                .register(
                        any(RegisterRequest.class));
    }
}