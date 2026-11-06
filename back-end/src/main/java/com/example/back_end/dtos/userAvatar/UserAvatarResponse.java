package com.example.back_end.dtos.userAvatar;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Response DTO containing user avatar metadata.
 *
 * Provides information about the avatar associated with
 * a user without exposing the internal MongoDB file identifier.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserAvatarResponse {

    private Long idAvatar;
    private Long userId;
    private String fileName;
    private String contentType;
    private Long fileSize;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
