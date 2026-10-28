package com.example.back_end.dtos.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Response returned after successfully refreshing an authenticated session.
 *
 * <p>
 * Contains the newly generated access token that the client can use to
 * authenticate subsequent requests to protected API endpoints.
 * </p>
 */
@Getter
@AllArgsConstructor
public class RefreshTokenResponse {

    /**
     * Newly generated access token.
     */
    private final String token;
}