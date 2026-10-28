package com.example.back_end.dtos.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Internal result of a successful refresh token operation.
 *
 * <p>
 * It contains the public API response together with the newly generated
 * refresh token. The refresh token is not returned in the JSON response and
 * will instead be stored in an HttpOnly cookie by the controller.
 * </p>
 */
@Getter
@AllArgsConstructor
public class RefreshTokenResult {

    /**
     * Response containing the newly generated access token.
     */
    private final RefreshTokenResponse response;

    /**
     * Newly generated refresh token that will be stored in an HttpOnly cookie.
     */
    private final String refreshToken;
}
