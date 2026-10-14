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
 * Servicio encargado de crear, leer y validar JSON Web Tokens (JWT).
 *
 * <p>El token identifica al usuario mediante el claim {@code sub} (subject),
 * que en este proyecto contiene el username. Tambien incluye fecha de emision
 * y fecha de expiracion.</p>
 */
@Service
public class JwtService {

    /**
     * Clave utilizada para firmar y verificar los JWT.
     *
     * <p>Para un proyecto real deberia almacenarse fuera del codigo fuente,
     * por ejemplo en una variable de entorno o un gestor de secretos.</p>
     */
    private static final String SECRET_KEY = "Q9mR7xT4vN2kL8pS6dF3hJ1cW5zB7yU9eA4gH8qK2mP6rV3t";

    /**
     * Genera un JWT para un usuario sin claims adicionales.
     *
     * @param user usuario autenticado
     * @return token JWT firmado
     */
    public String getToken(UserDetails user) {
        return getToken(new HashMap<>(), user);
    }

    /**
     * Construye el JWT completo.
     *
     * <p>El token tiene una duracion de una hora desde el momento de su creacion.</p>
     *
     * @param extraClaims claims adicionales que se quieran incluir
     * @param user usuario para el que se genera el token
     * @return token JWT firmado
     */
    private String getToken(Map<String, Object> extraClaims, UserDetails user) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(user.getUsername())
                .setIssuedAt(Date.from(Instant.now()))
                .setExpiration(Date.from(Instant.now().plus(1, ChronoUnit.HOURS)))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Convierte la clave configurada en una Key compatible con HMAC-SHA.
     *
     * @return clave utilizada para firmar y validar los JWT
     */
    private Key getKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Extrae el username almacenado como subject dentro del JWT.
     *
     * @param token JWT recibido
     * @return username incluido en el token
     */
    public String getUsernameFromToken(String token) {
        return getClaim(token, Claims::getSubject);
    }

    /**
     * Comprueba que el token pertenece al usuario esperado y que no ha caducado.
     *
     * @param token JWT a validar
     * @param userDetails usuario cargado desde base de datos
     * @return true si el token es valido; false en caso contrario
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = getUsernameFromToken(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    /**
     * Lee todos los claims de un token verificando previamente su firma.
     *
     * @param token JWT recibido
     * @return claims contenidos en el token
     */
    private Claims getAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Metodo generico para obtener un claim concreto del token.
     *
     * @param token JWT recibido
     * @param claimsResolver funcion que selecciona el claim deseado
     * @param <T> tipo del valor devuelto
     * @return valor del claim solicitado
     */
    public <T> T getClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /** Obtiene la fecha de expiracion del token. */
    private Date getExpiration(String token) {
        return getClaim(token, Claims::getExpiration);
    }

    /** Comprueba si la fecha de expiracion del token ya ha pasado. */
    private boolean isTokenExpired(String token) {
        return getExpiration(token).before(new Date());
    }
}

