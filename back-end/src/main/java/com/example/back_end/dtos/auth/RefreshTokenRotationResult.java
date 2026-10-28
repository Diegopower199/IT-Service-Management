package com.example.back_end.dtos.auth;

import com.example.back_end.model.UserModel;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Internal result of a refresh token rotation operation.
 *
 * <p>
 * Contains the user associated with the validated refresh token and the newly
 * generated refresh token that replaces the previous one.
 * </p>
 */
@Getter
@AllArgsConstructor
public class RefreshTokenRotationResult {

    private final UserModel user;

    private final String refreshToken;
}
