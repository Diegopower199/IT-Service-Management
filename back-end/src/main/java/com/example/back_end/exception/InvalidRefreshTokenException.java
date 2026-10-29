package com.example.back_end.exception;

/**
 * Exception thrown when a refresh token cannot be used to renew an
 * authenticated session.
 *
 * <p>
 * A refresh token is considered invalid when it is missing, does not exist,
 * has expired, has been revoked, or belongs to a disabled user.
 * </p>
 */
public class InvalidRefreshTokenException extends RuntimeException {

    public InvalidRefreshTokenException() {
        super("Invalid or expired refresh token");
    }
}