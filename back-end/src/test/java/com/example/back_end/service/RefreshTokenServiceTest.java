package com.example.back_end.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.example.back_end.dtos.auth.RefreshTokenRotationResult;
import com.example.back_end.exception.InvalidRefreshTokenException;
import com.example.back_end.model.RefreshTokenModel;
import com.example.back_end.model.UserModel;
import com.example.back_end.repository.RefreshTokenRepository;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private UserModel user;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    @BeforeEach
    void setUp() {

        ReflectionTestUtils.setField(
                refreshTokenService,
                "refreshTokenExpirationDays",
                7L);
    }

    @Test
    void createRefreshTokenShouldCreateAndStoreHashedToken() {

        LocalDateTime beforeCreation = LocalDateTime.now();

        String refreshToken = refreshTokenService.createRefreshToken(user);

        LocalDateTime afterCreation = LocalDateTime.now();

        assertThat(refreshToken)
                .isNotBlank();

        ArgumentCaptor<RefreshTokenModel> tokenCaptor = ArgumentCaptor.forClass(RefreshTokenModel.class);

        verify(refreshTokenRepository)
                .save(tokenCaptor.capture());

        RefreshTokenModel savedToken = tokenCaptor.getValue();

        assertThat(savedToken.getTokenHash())
                .isEqualTo(hashToken(refreshToken));

        assertThat(savedToken.getTokenHash())
                .isNotEqualTo(refreshToken);

        assertThat(savedToken.getUser())
                .isSameAs(user);

        assertThat(savedToken.isRevoked())
                .isFalse();

        assertThat(savedToken.getCreatedAt())
                .isBetween(
                        beforeCreation,
                        afterCreation);

        assertThat(savedToken.getExpiresAt())
                .isBetween(
                        beforeCreation.plusDays(7),
                        afterCreation.plusDays(7));
    }

    @Test
    void validateRefreshTokenShouldReturnStoredTokenWhenTokenIsValid() {

        String refreshToken = "valid-refresh-token";
        String tokenHash = hashToken(refreshToken);

        RefreshTokenModel storedToken = createRefreshToken(
                tokenHash,
                LocalDateTime.now().plusDays(1),
                false);

        when(refreshTokenRepository.findByTokenHash(tokenHash))
                .thenReturn(Optional.of(storedToken));

        when(user.isEnabled())
                .thenReturn(true);

        RefreshTokenModel result = refreshTokenService.validateRefreshToken(refreshToken);

        assertThat(result)
                .isSameAs(storedToken);

        verify(refreshTokenRepository)
                .findByTokenHash(tokenHash);

        verify(user).isEnabled();
    }

    @Test
    void validateRefreshTokenShouldThrowExceptionWhenTokenIsNull() {

        assertThatThrownBy(
                () -> refreshTokenService.validateRefreshToken(null))
                .isInstanceOf(InvalidRefreshTokenException.class);

        verify(refreshTokenRepository, never())
                .findByTokenHash(any());
    }

    @Test
    void validateRefreshTokenShouldThrowExceptionWhenTokenIsBlank() {

        assertThatThrownBy(
                () -> refreshTokenService.validateRefreshToken(" "))
                .isInstanceOf(InvalidRefreshTokenException.class);

        verify(refreshTokenRepository, never())
                .findByTokenHash(any());
    }

    @Test
    void validateRefreshTokenShouldThrowExceptionWhenTokenDoesNotExist() {

        String refreshToken = "invalid-refresh-token";
        String tokenHash = hashToken(refreshToken);

        when(refreshTokenRepository.findByTokenHash(tokenHash))
                .thenReturn(Optional.empty());

        assertThatThrownBy(
                () -> refreshTokenService.validateRefreshToken(refreshToken))
                .isInstanceOf(InvalidRefreshTokenException.class);

        verify(refreshTokenRepository)
                .findByTokenHash(tokenHash);
    }

    @Test
    void validateRefreshTokenShouldThrowExceptionWhenTokenIsRevoked() {

        String refreshToken = "revoked-refresh-token";
        String tokenHash = hashToken(refreshToken);

        RefreshTokenModel storedToken = createRefreshToken(
                tokenHash,
                LocalDateTime.now().plusDays(1),
                true);

        when(refreshTokenRepository.findByTokenHash(tokenHash))
                .thenReturn(Optional.of(storedToken));

        assertThatThrownBy(
                () -> refreshTokenService.validateRefreshToken(refreshToken))
                .isInstanceOf(InvalidRefreshTokenException.class);

        verify(refreshTokenRepository)
                .findByTokenHash(tokenHash);

        verify(user, never()).isEnabled();
    }

    @Test
    void validateRefreshTokenShouldThrowExceptionWhenTokenIsExpired() {

        String refreshToken = "expired-refresh-token";
        String tokenHash = hashToken(refreshToken);

        RefreshTokenModel storedToken = createRefreshToken(
                tokenHash,
                LocalDateTime.now().minusMinutes(1),
                false);

        when(refreshTokenRepository.findByTokenHash(tokenHash))
                .thenReturn(Optional.of(storedToken));

        assertThatThrownBy(
                () -> refreshTokenService.validateRefreshToken(refreshToken))
                .isInstanceOf(InvalidRefreshTokenException.class);

        verify(refreshTokenRepository)
                .findByTokenHash(tokenHash);

        verify(user, never()).isEnabled();
    }

    @Test
    void validateRefreshTokenShouldThrowExceptionWhenUserIsDisabled() {

        String refreshToken = "disabled-user-token";
        String tokenHash = hashToken(refreshToken);

        RefreshTokenModel storedToken = createRefreshToken(
                tokenHash,
                LocalDateTime.now().plusDays(1),
                false);

        when(refreshTokenRepository.findByTokenHash(tokenHash))
                .thenReturn(Optional.of(storedToken));

        when(user.isEnabled())
                .thenReturn(false);

        assertThatThrownBy(
                () -> refreshTokenService.validateRefreshToken(refreshToken))
                .isInstanceOf(InvalidRefreshTokenException.class);

        verify(refreshTokenRepository)
                .findByTokenHash(tokenHash);

        verify(user).isEnabled();
    }

    @Test
    void rotateRefreshTokenShouldRevokeOldTokenAndCreateNewToken() {

        String oldRefreshToken = "old-refresh-token";
        String oldTokenHash = hashToken(oldRefreshToken);

        RefreshTokenModel storedToken = createRefreshToken(
                oldTokenHash,
                LocalDateTime.now().plusDays(1),
                false);

        when(refreshTokenRepository.findByTokenHash(oldTokenHash))
                .thenReturn(Optional.of(storedToken));

        when(user.isEnabled())
                .thenReturn(true);

        RefreshTokenRotationResult result = refreshTokenService.rotateRefreshToken(oldRefreshToken);

        assertThat(result)
                .isNotNull();

        assertThat(result.getUser())
                .isSameAs(user);

        assertThat(result.getRefreshToken())
                .isNotBlank()
                .isNotEqualTo(oldRefreshToken);

        assertThat(storedToken.isRevoked())
                .isTrue();

        ArgumentCaptor<RefreshTokenModel> tokenCaptor = ArgumentCaptor.forClass(RefreshTokenModel.class);

        verify(refreshTokenRepository, times(2))
                .save(tokenCaptor.capture());

        List<RefreshTokenModel> savedTokens = tokenCaptor.getAllValues();

        RefreshTokenModel revokedToken = savedTokens.get(0);

        RefreshTokenModel newToken = savedTokens.get(1);

        assertThat(revokedToken)
                .isSameAs(storedToken);

        assertThat(revokedToken.isRevoked())
                .isTrue();

        assertThat(newToken)
                .isNotSameAs(storedToken);

        assertThat(newToken.getUser())
                .isSameAs(user);

        assertThat(newToken.isRevoked())
                .isFalse();

        assertThat(newToken.getTokenHash())
                .isEqualTo(
                        hashToken(result.getRefreshToken()));
    }

    @Test
    void revokeRefreshTokenShouldRevokeExistingToken() {

        String refreshToken = "refresh-token";
        String tokenHash = hashToken(refreshToken);

        RefreshTokenModel storedToken = createRefreshToken(
                tokenHash,
                LocalDateTime.now().plusDays(1),
                false);

        when(refreshTokenRepository.findByTokenHash(tokenHash))
                .thenReturn(Optional.of(storedToken));

        refreshTokenService.revokeRefreshToken(refreshToken);

        assertThat(storedToken.isRevoked())
                .isTrue();

        verify(refreshTokenRepository)
                .findByTokenHash(tokenHash);

        verify(refreshTokenRepository)
                .save(storedToken);
    }

    @Test
    void revokeRefreshTokenShouldDoNothingWhenTokenDoesNotExist() {

        String refreshToken = "unknown-refresh-token";
        String tokenHash = hashToken(refreshToken);

        when(refreshTokenRepository.findByTokenHash(tokenHash))
                .thenReturn(Optional.empty());

        refreshTokenService.revokeRefreshToken(refreshToken);

        verify(refreshTokenRepository)
                .findByTokenHash(tokenHash);

        verify(refreshTokenRepository, never())
                .save(any(RefreshTokenModel.class));
    }

    @Test
    void revokeAllUserRefreshTokensShouldRevokeAllActiveTokens() {

        RefreshTokenModel firstToken = createRefreshToken(
                "first-hash",
                LocalDateTime.now().plusDays(1),
                false);

        RefreshTokenModel secondToken = createRefreshToken(
                "second-hash",
                LocalDateTime.now().plusDays(1),
                false);

        List<RefreshTokenModel> activeTokens = List.of(firstToken, secondToken);

        when(refreshTokenRepository.findByUserAndRevokedFalse(user))
                .thenReturn(activeTokens);

        refreshTokenService.revokeAllUserRefreshTokens(user);

        assertThat(firstToken.isRevoked())
                .isTrue();

        assertThat(secondToken.isRevoked())
                .isTrue();

        verify(refreshTokenRepository)
                .findByUserAndRevokedFalse(user);

        verify(refreshTokenRepository)
                .saveAll(activeTokens);
    }

    private RefreshTokenModel createRefreshToken(
            String tokenHash,
            LocalDateTime expiresAt,
            boolean revoked) {

        RefreshTokenModel refreshToken = new RefreshTokenModel();

        refreshToken.setTokenHash(tokenHash);
        refreshToken.setUser(user);
        refreshToken.setCreatedAt(LocalDateTime.now());
        refreshToken.setExpiresAt(expiresAt);
        refreshToken.setRevoked(revoked);

        return refreshToken;
    }

    private String hashToken(String token) {

        try {

            MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");

            byte[] hash = messageDigest.digest(
                    token.getBytes(StandardCharsets.UTF_8));

            return HexFormat.of()
                    .formatHex(hash);

        } catch (NoSuchAlgorithmException exception) {

            throw new IllegalStateException(exception);
        }
    }
}
