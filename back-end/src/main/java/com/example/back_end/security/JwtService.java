package com.example.back_end.security;

import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

/**
 * Service responsible for generating, parsing, and validating JSON Web Tokens
 * (JWT).
 *
 * <p>
 * The token identifies the authenticated user through the {@code sub}
 * (subject) claim, which contains the username. It also includes the token
 * issuance and expiration timestamps.
 * </p>
 */
@Service
public class JwtService {

    /**
     * Secret key used to sign and verify JWTs.
     *
     * <p>
     * This value should not be stored directly in the source code in a
     * production environment. It should be provided through an environment
     * variable or a secrets management system.
     * </p>
     */
    private static final String SECRET_KEY = "Q9mR7xT4vN2kL8pS6dF3hJ1cW5zB7yU9eA4gH8qK2mP6rV3t";

    /**
     * Generates a JWT for the specified user without additional claims.
     *
     * @param user the authenticated user
     * @return the signed JWT
     */
    public String getToken(UserDetails user) {
        return getToken(new HashMap<>(), user);
    }

    /**
     * Generates a signed JWT for the specified user.
     *
     * <p>
     * The token is valid for one hour from the time it is generated.
     * </p>
     *
     * @param extraClaims additional claims to include in the token
     * @param user        the user for whom the token is generated
     * @return the signed JWT
     */
    private String getToken(
            Map<String, Object> extraClaims,
            UserDetails user) {

        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(user.getUsername())
                .setIssuedAt(Date.from(Instant.now()))
                .setExpiration(
                        Date.from(
                                Instant.now().plus(
                                        1,
                                        ChronoUnit.HOURS)))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Converts the configured Base64-encoded secret into a key compatible with
     * HMAC-based JWT signing.
     *
     * @return the key used to sign and verify JWTs
     */
    private Key getKey() {

        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);

        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Extracts the username stored in the JWT subject claim.
     *
     * @param token the JWT to parse
     * @return the username contained in the token
     */
    public String getUsernameFromToken(String token) {
        return getClaim(token, Claims::getSubject);
    }

    /**
     * Validates that the token belongs to the expected user and has not expired.
     *
     * @param token       the JWT to validate
     * @param userDetails the user loaded from the application
     * @return {@code true} if the token is valid; {@code false} otherwise
     */
    public boolean isTokenValid(
            String token,
            UserDetails userDetails) {

        final String username = getUsernameFromToken(token);

        return userDetails.getUsername().equals(username)
                && !isTokenExpired(token);
    }

    /**
     * Parses all claims contained in the JWT and verifies its signature.
     *
     * @param token the JWT to parse
     * @return the claims contained in the token
     */
    private Claims getAllClaims(String token) {

        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Extracts a specific claim from the JWT.
     *
     * @param token          the JWT to parse
     * @param claimsResolver function used to extract the desired claim
     * @param <T>            the type of the extracted claim
     * @return the requested claim value
     */
    public <T> T getClaim(
            String token,
            Function<Claims, T> claimsResolver) {

        final Claims claims = getAllClaims(token);

        return claimsResolver.apply(claims);
    }

    /**
     * Returns the expiration date stored in the JWT.
     *
     * @param token the JWT to parse
     * @return the token expiration date
     */
    private Date getExpiration(String token) {
        return getClaim(token, Claims::getExpiration);
    }

    /**
     * Determines whether the JWT has expired.
     *
     * @param token the JWT to validate
     * @return {@code true} if the token has expired; {@code false} otherwise
     */
    private boolean isTokenExpired(String token) {
        return getExpiration(token).before(new Date());
    }
}