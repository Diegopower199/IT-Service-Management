package com.example.back_end.security;

import java.io.IOException;

import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * Filtro que revisa una vez cada peticion HTTP y autentica al usuario mediante
 * JWT.
 *
 * <p>
 * Su trabajo es:
 * </p>
 * <ol>
 * <li>Buscar la cabecera {@code Authorization}.</li>
 * <li>Extraer el token despues de {@code Bearer }.</li>
 * <li>Obtener el username incluido en el token.</li>
 * <li>Cargar el usuario desde la base de datos.</li>
 * <li>Validar el JWT.</li>
 * <li>Guardar la autenticacion en el {@link SecurityContextHolder}.</li>
 * </ol>
 *
 * <p>
 * Si no existe token, el filtro simplemente deja continuar la peticion.
 * Mas adelante, {@code SecurityConfig} decide si el endpoint era publico o
 * necesitaba un usuario autenticado.
 * </p>
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    /**
     * Se ejecuta una vez por cada peticion que pasa por la cadena de filtros.
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        final String token = getTokenFromRequest(request);

        // Si no hay JWT, no autenticamos aqui. La peticion continua normalmente.
        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        final String username = jwtService.getUsernameFromToken(token);

        // Solo autenticamos si el token contiene usuario y todavia no existe
        // una autenticacion previa para esta peticion.
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtService.isTokenValid(token, userDetails)) {
                // Representa una autenticacion ya validada. La password pasa a null
                // porque no necesitamos conservarla en el SecurityContext.
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities());

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // A partir de aqui Spring considera autenticado al usuario
                // durante el resto de esta peticion.
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extrae el JWT de la cabecera Authorization.
     *
     * <p>
     * La cabecera esperada tiene este formato:
     * </p>
     * 
     * <pre>
     * Authorization: Bearer eyJhbGciOi...
     * </pre>
     *
     * @param request peticion HTTP actual
     * @return token sin el prefijo Bearer, o null si no existe
     */
    private String getTokenFromRequest(HttpServletRequest request) {
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        return null;
    }
}
