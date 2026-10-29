package com.example.back_end.controller;


import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.back_end.config.SecurityConfig;
import com.example.back_end.dtos.auth.AuthLoginResponse;
import com.example.back_end.dtos.auth.AuthLoginResult;
import com.example.back_end.dtos.auth.LoginRequest;
import com.example.back_end.security.JwtAuthenticationEntryPoint;
import com.example.back_end.security.JwtAuthenticationFilter;
import com.example.back_end.security.JwtService;
import com.example.back_end.service.AuthService;

@WebMvcTest(
        value = AuthController.class,
        properties = {
                "jwt.refresh-token-expiration-days=7",
                "app.cookie.secure=false"
        })
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

    @MockitoBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    // =========================================================
    // LOGIN
    // =========================================================

    @Test
    void shouldLoginSuccessfully()
            throws Exception {

        AuthLoginResponse response =
                new AuthLoginResponse(
                        "jwt-token",
                        "ana",
                        "USER");

        AuthLoginResult result =
                new AuthLoginResult(
                        response,
                        "refresh-token");

        when(authService.login(
                any(LoginRequest.class)))
                .thenReturn(result);

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
                                .value("jwt-token"))
                .andExpect(
                        jsonPath("$.username")
                                .value("ana"))
                .andExpect(
                        jsonPath("$.role")
                                .value("USER"))
                .andExpect(
                        header().string(
                                HttpHeaders.SET_COOKIE,
                                containsString(
                                        "refreshToken=refresh-token")))
                .andExpect(
                        header().string(
                                HttpHeaders.SET_COOKIE,
                                containsString(
                                        "HttpOnly")))
                .andExpect(
                        header().string(
                                HttpHeaders.SET_COOKIE,
                                containsString(
                                        "SameSite=Strict")));

        verify(authService)
                .login(
                        any(LoginRequest.class));
    }
}