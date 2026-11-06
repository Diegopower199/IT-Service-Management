package com.example.back_end.controller;

import java.io.IOException;

import org.springframework.core.io.Resource;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.back_end.dtos.userAvatar.UserAvatarResponse;
import com.example.back_end.service.UserAvatarService;

import lombok.RequiredArgsConstructor;

/**
 * REST controller for managing user profile avatars.
 *
 * Provides endpoints for retrieving avatar metadata and images,
 * uploading or replacing the authenticated user's avatar,
 * and deleting the authenticated user's avatar.
 */
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserAvatarController {

    private final UserAvatarService userAvatarService;

    /**
     * Retrieves the avatar metadata associated with a user.
     *
     * @param userId identifier of the user
     * @return avatar metadata
     */
    @GetMapping("/{userId}/avatar/metadata")
    public ResponseEntity<UserAvatarResponse> getAvatarMetadata(
            @PathVariable Long userId) {

        UserAvatarResponse response = userAvatarService.getAvatarByUserId(userId);

        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves the avatar image associated with a user.
     *
     * @param userId identifier of the user
     * @return avatar image
     * @throws IOException if the image cannot be read
     */
    @GetMapping("/{userId}/avatar")
    public ResponseEntity<Resource> getAvatar(
            @PathVariable Long userId) throws IOException {

        GridFsResource avatar = userAvatarService.getAvatarFileByUserId(userId);

        return ResponseEntity.ok()
                .contentType(
                        MediaType.parseMediaType(
                                avatar.getContentType()))
                .contentLength(avatar.contentLength())
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline()
                                .filename(avatar.getFilename())
                                .build()
                                .toString())
                .header("X-Content-Type-Options", "nosniff")
                .cacheControl(CacheControl.noStore())
                .body(avatar);
    }

    /**
     * Uploads or replaces the authenticated user's avatar.
     *
     * @param file uploaded avatar image
     * @return updated avatar metadata
     * @throws IOException if the image cannot be stored
     */
    @PutMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserAvatarResponse> saveMyAvatar(
            @RequestPart("file") MultipartFile file)
            throws IOException {

        UserAvatarResponse response = userAvatarService.saveMyAvatar(file);

        return ResponseEntity.ok(response);
    }

    /**
     * Deletes the authenticated user's avatar.
     *
     * @return HTTP 204 No Content
     */
    @DeleteMapping("/me/avatar")
    public ResponseEntity<Void> deleteMyAvatar() {

        userAvatarService.deleteMyAvatar();

        return ResponseEntity.noContent().build();
    }
}
