package com.example.back_end.config;

import java.util.List;

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
import com.example.back_end.utils.GlobalConstants;

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

    /**
     * Configures the security filter chain applied to HTTP requests.
     *
     * <p>
     * The current security configuration:
     * </p>
     *
     * <ul>
     * <li>Disables CSRF protection because the API uses stateless JWT
     * authentication.</li>
     * <li>Allows unauthenticated access to the login, refresh, and logout
     * authentication endpoints.</li>
     * <li>Requires authentication for every other endpoint.</li>
     * <li>Returns a standardized HTTP 401 response when authentication fails.</li>
     * <li>Uses stateless session management, so no HTTP session is stored on the
     * server.</li>
     * <li>Registers the custom JWT authentication filter before
     * {@link UsernamePasswordAuthenticationFilter}.</li>
     * </ul>
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
     * The configuration permits the HTTP methods and headers required by the
     * REST API and JWT authentication.
     * </p>
     *
     * <p>
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
                List.of(GlobalConstants.FRONTEND_URL));

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