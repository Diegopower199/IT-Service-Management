package com.example.back_end.config;

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

import com.example.back_end.security.JwtAuthenticationFilter;

import static org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher.withDefaults;

import lombok.RequiredArgsConstructor;

/**
 * Configuracion principal de seguridad HTTP.
 *
 * <p>
 * Define que endpoints son publicos, cuales requieren autenticacion y donde
 * se coloca el filtro JWT dentro de la cadena de filtros de Spring Security.
 * </p>
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AuthenticationProvider authProvider;

    /**
     * Construye la cadena de seguridad aplicada a las peticiones HTTP.
     *
     * <p>
     * Configuracion actual:
     * </p>
     * <ul>
     * <li>CSRF desactivado, habitual en una API REST stateless con JWT.</li>
     * <li>{@code /auth/**} es publico.</li>
     * <li>Cualquier otra ruta requiere un usuario autenticado.</li>
     * <li>No se mantienen sesiones HTTP en el servidor.</li>
     * <li>El filtro JWT se ejecuta antes del filtro tradicional de
     * usuario/password.</li>
     * </ul>
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        PathPatternRequestMatcher.Builder mvc = withDefaults().basePath("/api/v1");

        return http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authRequest -> authRequest
                        .requestMatchers(
                                mvc.matcher("/auth/**"))
                        .permitAll()
                        .anyRequest().authenticated())
                .sessionManagement(sessionManager -> sessionManager
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authProvider)
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
