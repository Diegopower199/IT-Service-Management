package com.example.back_end.service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.example.back_end.dtos.auth.RefreshTokenRotationResult;
import com.example.back_end.exception.InvalidRefreshTokenException;
import com.example.back_end.model.RefreshTokenModel;
import com.example.back_end.model.UserModel;
import com.example.back_end.repository.RefreshTokenRepository;

import lombok.RequiredArgsConstructor;

/**
 * Service responsible for managing refresh tokens.
 *
 * <p>
 * Refresh tokens are generated using a cryptographically secure random
 * generator. Only their SHA-256 hashes are stored in the database, while the
 * original token is returned to the caller so it can later be stored in a
 * secure HttpOnly cookie.
 * </p>
 */
@Service
@RequiredArgsConstructor
@Transactional
public class RefreshTokenService {

    @Value("${jwt.refresh-token-expiration-days}")
    private long refreshTokenExpirationDays;

    private static final int TOKEN_SIZE_BYTES = 32;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * Creates a new refresh token for the specified user.
     *
     * <p>
     * The plain-text token is returned only once. The database stores only its
     * SHA-256 hash.
     * </p>
     *
     * @param user the user associated with the refresh token
     * @return the generated plain-text refresh token
     */
    public String createRefreshToken(UserModel user) {

        String refreshToken = generateSecureToken();
        String tokenHash = hashToken(refreshToken);

        LocalDateTime now = LocalDateTime.now();

        RefreshTokenModel refreshTokenModel = new RefreshTokenModel();

        refreshTokenModel.setTokenHash(tokenHash);
        refreshTokenModel.setUser(user);
        refreshTokenModel.setCreatedAt(now);
        refreshTokenModel.setExpiresAt(now.plusDays(refreshTokenExpirationDays));
        refreshTokenModel.setRevoked(false);

        refreshTokenRepository.save(refreshTokenModel);

        return refreshToken;
    }

    /**
     * Validates a refresh token and returns its stored representation.
     *
     * <p>
     * A refresh token is considered valid only when it exists, has not been
     * revoked, has not expired, and belongs to an enabled user.
     * </p>
     *
     * @param refreshToken the plain-text refresh token received from the client
     * @return the corresponding valid refresh token entity
     * @throws InvalidRefreshTokenException if the token is missing, invalid,
     *                                      revoked, expired, or belongs to a
     *                                      disabled user
     */
    public RefreshTokenModel validateRefreshToken(
            String refreshToken) {

        if (!StringUtils.hasText(refreshToken)) {
            throw new InvalidRefreshTokenException();
        }

        String tokenHash = hashToken(refreshToken);

        RefreshTokenModel storedToken = refreshTokenRepository
                .findByTokenHash(tokenHash)
                .orElseThrow(
                        InvalidRefreshTokenException::new);

        if (storedToken.isRevoked()) {
            throw new InvalidRefreshTokenException();
        }

        if (storedToken.getExpiresAt()
                .isBefore(LocalDateTime.now())) {

            throw new InvalidRefreshTokenException();
        }

        if (!storedToken.getUser().isEnabled()) {
            throw new InvalidRefreshTokenException();
        }

        return storedToken;
    }

    /**
     * Validates and rotates an existing refresh token.
     *
     * <p>
     * The current refresh token is validated, revoked, and replaced with a newly
     * generated refresh token associated with the same user.
     * </p>
     *
     * @param refreshToken the current refresh token
     * @return result containing the associated user and the newly generated
     *         refresh token
     */
    public RefreshTokenRotationResult rotateRefreshToken(
            String refreshToken) {

        RefreshTokenModel storedToken = validateRefreshToken(refreshToken);

        UserModel user = storedToken.getUser();

        storedToken.setRevoked(true);

        refreshTokenRepository.save(storedToken);

        String newRefreshToken = createRefreshToken(user);

        return new RefreshTokenRotationResult(
                user,
                newRefreshToken);
    }

    /**
     * Revokes a specific refresh token.
     *
     * @param refreshToken the refresh token to revoke
     */
    public void revokeRefreshToken(
            String refreshToken) {

        String tokenHash = hashToken(refreshToken);

        refreshTokenRepository
                .findByTokenHash(tokenHash)
                .ifPresent(token -> {

                    token.setRevoked(true);

                    refreshTokenRepository.save(token);
                });
    }

    /**
     * Revokes all active refresh tokens associated with a user.
     *
     * <p>
     * This can be used when all sessions belonging to a user need to be
     * invalidated.
     * </p>
     *
     * @param user the user whose refresh tokens should be revoked
     */
    public void revokeAllUserRefreshTokens(
            UserModel user) {

        List<RefreshTokenModel> activeTokens = refreshTokenRepository
                .findByUserAndRevokedFalse(user);

        activeTokens.forEach(
                token -> token.setRevoked(true));

        refreshTokenRepository.saveAll(activeTokens);
    }

    /**
     * Generates a cryptographically secure random refresh token.
     *
     * @return a URL-safe Base64 encoded token
     */
    private String generateSecureToken() {

        byte[] randomBytes = new byte[TOKEN_SIZE_BYTES];

        SECURE_RANDOM.nextBytes(randomBytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);
    }

    /**
     * Calculates the SHA-256 hash of a refresh token.
     *
     * @param token the plain-text refresh token
     * @return the hexadecimal SHA-256 hash
     */
    private String hashToken(String token) {

        try {

            MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");

            byte[] hash = messageDigest.digest(
                    token.getBytes(
                            java.nio.charset.StandardCharsets.UTF_8));

            return HexFormat.of()
                    .formatHex(hash);

        } catch (NoSuchAlgorithmException exception) {

            throw new IllegalStateException(
                    "SHA-256 algorithm is not available",
                    exception);
        }
    }
}