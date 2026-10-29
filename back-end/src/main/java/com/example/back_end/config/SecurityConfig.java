package com.example.back_end.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.back_end.security.JwtAuthenticationEntryPoint;
import com.example.back_end.security.JwtAuthenticationFilter;

import jakarta.servlet.http.HttpServletResponse;

import static org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher.withDefaults;

import lombok.RequiredArgsConstructor;

/**
 * Main HTTP security configuration for the application.
 *
 * <p>
 * Defines public and protected endpoints, configures stateless authentication
 * using JWT, handles authentication failures, configures CORS, and registers
 * the JWT authentication filter in the Spring Security filter chain.
 * </p>
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final AuthenticationProvider authProvider;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    /**
     * Configures the security filter chain applied to HTTP requests.
     *
     * @param http the {@link HttpSecurity} instance used to configure web security
     * @return the configured {@link SecurityFilterChain}
     * @throws Exception if the security configuration cannot be built
     */
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http)
            throws Exception {

        PathPatternRequestMatcher.Builder mvc = withDefaults()
                .basePath("/api/v1");

        return http
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(authRequest -> authRequest
                        .requestMatchers(
                                mvc.matcher("/auth/login"),
                                mvc.matcher("/auth/refresh"),
                                mvc.matcher("/auth/logout"))
                        .permitAll()
                        .anyRequest()
                        .authenticated())

                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(
                                jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(
                                (request, response, accessDeniedException) -> {
                                    response.sendError(
                                            HttpServletResponse.SC_FORBIDDEN,
                                            "Forbidden");
                                }))

                .sessionManagement(sessionManager -> sessionManager
                        .sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS))

                .authenticationProvider(authProvider)

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class)

                .build();
    }

    /**
     * Configures Cross-Origin Resource Sharing (CORS) for the application.
     *
     * <p>
     * Requests are allowed only from the configured front-end origin.
     * Credentials are enabled so the browser can send the HttpOnly refresh
     * token cookie between the front-end and back-end applications.
     * </p>
     *
     * @return the configured {@link UrlBasedCorsConfigurationSource}
     */
    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(frontendUrl));

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"));

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type"));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration);

        return source;
    }
}