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
 * JWT authentication filter executed once per HTTP request.
 *
 * <p>
 * Its responsibilities are:
 * </p>
 *
 * <ol>
 * <li>Read the {@code Authorization} header.</li>
 * <li>Extract the JWT from the {@code Bearer} authentication scheme.</li>
 * <li>Retrieve the username contained in the token.</li>
 * <li>Load the corresponding user from the database.</li>
 * <li>Validate the JWT against the loaded user.</li>
 * <li>Store the resulting authentication in the
 * {@link SecurityContextHolder}.</li>
 * </ol>
 *
 * <p>
 * If no JWT is present, the filter does not authenticate the request and simply
 * continues the filter chain. The authorization rules defined in the security
 * configuration determine whether the requested endpoint can be accessed
 * anonymously or requires an authenticated user.
 * </p>
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    /**
     * Processes the current HTTP request and attempts to authenticate the user
     * using the JWT provided in the {@code Authorization} header.
     *
     * @param request     the current HTTP request
     * @param response    the current HTTP response
     * @param filterChain the remaining servlet filter chain
     * @throws ServletException if the request cannot be processed by the filter
     *                          chain
     * @throws IOException      if an I/O error occurs while processing the request
     */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        final String token = getTokenFromRequest(request);

        // If no JWT is provided, no authentication is performed here.
        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        final String username = jwtService.getUsernameFromToken(token);

        // Authenticate only when the token contains a username and no authentication
        // has already been established for the current request.
        if (username != null
                && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtService.isTokenValid(token, userDetails)) {

                // Represents an already authenticated principal.
                // The credentials are set to null because the password must not be
                // stored in the SecurityContext.
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities());

                authToken.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request));

                // From this point on, Spring Security considers the user authenticated
                // for the remainder of the current request.
                SecurityContextHolder.getContext()
                        .setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extracts the JWT from the {@code Authorization} header.
     *
     * <p>
     * The expected header format is:
     * </p>
     *
     * <pre>
     * Authorization: Bearer eyJhbGciOi...
     * </pre>
     *
     * @param request the current HTTP request
     * @return the JWT without the {@code Bearer } prefix, or {@code null} if the
     *         header is missing or does not use the Bearer authentication scheme
     */
    private String getTokenFromRequest(HttpServletRequest request) {

        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (StringUtils.hasText(authHeader)
                && authHeader.startsWith("Bearer ")) {

            return authHeader.substring(7);
        }

        return null;
    }
}