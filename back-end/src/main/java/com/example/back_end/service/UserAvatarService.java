package com.example.back_end.service;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import com.example.back_end.dtos.userAvatar.UserAvatarResponse;
import com.example.back_end.enums.GridFsBucketType;
import com.example.back_end.exception.InvalidOperationException;
import com.example.back_end.exception.ResourceNotFoundException;
import com.example.back_end.model.UserAvatarModel;
import com.example.back_end.model.UserModel;
import com.example.back_end.repository.UserAvatarRepository;
import com.example.back_end.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for managing user profile avatars.
 *
 * Stores avatar metadata in MySQL and image contents
 * in the MongoDB GridFS "user_avatars" bucket.
 *
 * Supports retrieving, uploading, replacing and deleting avatars.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserAvatarService {

    private static final long MAX_AVATAR_SIZE = 5L * 1024 * 1024;

    private final UserAvatarRepository userAvatarRepository;
    private final UserRepository userRepository;
    private final MongoFileStorageService mongoFileStorageService;

    /**
     * Retrieves the avatar metadata associated with a user.
     *
     * @param userId identifier of the user
     * @return avatar metadata
     */
    @Transactional(readOnly = true)
    public UserAvatarResponse getAvatarByUserId(Long userId) {

        UserAvatarModel avatar = findAvatarByUserId(userId);

        return convertToResponse(avatar);
    }

    /**
     * Retrieves the avatar image associated with a user.
     *
     * Returns an empty Optional if the user exists
     * but has no avatar.
     *
     * @param userId identifier of the user
     * @return Optional containing the avatar image resource
     */
    @Transactional(readOnly = true)
    public Optional<GridFsResource> getAvatarFileByUserId(Long userId) {

        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }

        return userAvatarRepository.findByUser_IdUser(userId)
                .map(avatar -> mongoFileStorageService.getFile(
                        GridFsBucketType.USER_AVATARS,
                        avatar.getMongoFileId()));
    }

    /**
     * Uploads or replaces the authenticated user's avatar.
     *
     * Stores the new image in MongoDB before updating MySQL.
     * Cleans up the appropriate GridFS file after the transaction
     * completes.
     *
     * @param file uploaded avatar image
     * @return updated avatar metadata
     * @throws IOException if the image cannot be read or stored
     */
    @Transactional
    public UserAvatarResponse saveMyAvatar(MultipartFile file)
            throws IOException {

        UserModel user = getAuthenticatedUser();

        validateFileSize(file);

        String contentType = detectContentType(file);

        if (!contentType.equals(file.getContentType())) {
            throw new InvalidOperationException(
                    "File content does not match its declared content type");
        }

        String fileName = sanitizeFileName(
                file.getOriginalFilename(),
                contentType);

        Optional<UserAvatarModel> existingAvatar = userAvatarRepository.findByUser_IdUser(user.getIdUser());

        UserAvatarModel avatar = existingAvatar.orElseGet(
                UserAvatarModel::new);

        String previousMongoFileId = avatar.getMongoFileId();

        String newMongoFileId = mongoFileStorageService.saveFile(
                GridFsBucketType.USER_AVATARS,
                file,
                fileName,
                contentType);

        registerReplacementCleanup(
                newMongoFileId,
                previousMongoFileId);

        LocalDateTime now = LocalDateTime.now();

        if (existingAvatar.isEmpty()) {
            avatar.setUser(user);
            avatar.setCreatedAt(now);
        }

        avatar.setFileName(fileName);
        avatar.setContentType(contentType);
        avatar.setFileSize(file.getSize());
        avatar.setMongoFileId(newMongoFileId);
        avatar.setUpdatedAt(now);

        UserAvatarModel savedAvatar = userAvatarRepository.saveAndFlush(avatar);

        return convertToResponse(savedAvatar);
    }

    /**
     * Deletes the authenticated user's avatar.
     *
     * Removes the metadata from MySQL and deletes the
     * corresponding GridFS file after a successful commit.
     */
    @Transactional
    public void deleteMyAvatar() {

        UserModel user = getAuthenticatedUser();

        UserAvatarModel avatar = findAvatarByUserId(
                user.getIdUser());

        String mongoFileId = avatar.getMongoFileId();

        userAvatarRepository.delete(avatar);

        registerDeletionAfterCommit(mongoFileId);
    }

    /**
     * Retrieves the avatar entity associated with a user.
     *
     * @param userId identifier of the user
     * @return avatar entity
     */
    private UserAvatarModel findAvatarByUserId(Long userId) {

        return userAvatarRepository.findByUser_IdUser(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User avatar not found"));
    }

    /**
     * Retrieves the currently authenticated user.
     *
     * @return authenticated user entity
     */
    private UserModel getAuthenticatedUser() {

        Authentication authentication = SecurityContextHolder.getContext()
                .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {

            throw new AccessDeniedException(
                    "Authentication required");
        }

        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Authenticated user not found"));
    }

    /**
     * Validates that the uploaded file is not empty
     * and does not exceed the configured size limit.
     *
     * @param file uploaded image
     */
    private void validateFileSize(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new InvalidOperationException(
                    "Avatar image cannot be empty");
        }

        if (file.getSize() > MAX_AVATAR_SIZE) {
            throw new InvalidOperationException(
                    "Avatar image cannot exceed 5 MB");
        }
    }

    /**
     * Detects the actual image type using its file signature.
     *
     * Only JPEG and PNG images are supported.
     *
     * @param file uploaded image
     * @return detected MIME type
     * @throws IOException if the file cannot be read
     */
    private String detectContentType(MultipartFile file)
            throws IOException {

        byte[] header;

        try (InputStream inputStream = file.getInputStream()) {
            header = inputStream.readNBytes(8);
        }

        if (header.length >= 8
                && (header[0] & 0xFF) == 0x89
                && header[1] == 0x50
                && header[2] == 0x4E
                && header[3] == 0x47
                && header[4] == 0x0D
                && header[5] == 0x0A
                && header[6] == 0x1A
                && header[7] == 0x0A) {

            return "image/png";
        }

        if (header.length >= 3
                && (header[0] & 0xFF) == 0xFF
                && (header[1] & 0xFF) == 0xD8
                && (header[2] & 0xFF) == 0xFF) {

            return "image/jpeg";
        }

        throw new InvalidOperationException(
                "Only valid JPEG and PNG images are allowed");
    }

    /**
     * Sanitizes the original filename to prevent
     * directory paths and invalid control characters.
     *
     * @param originalFileName original filename
     * @param contentType      detected MIME type
     * @return sanitized filename
     */
    private String sanitizeFileName(
            String originalFileName,
            String contentType) {

        String extension = "image/png".equals(contentType)
                ? ".png"
                : ".jpg";

        if (originalFileName == null
                || originalFileName.isBlank()) {

            return "avatar" + extension;
        }

        String fileName = originalFileName
                .replace('\\', '/');

        fileName = fileName.substring(
                fileName.lastIndexOf('/') + 1);

        fileName = fileName
                .replaceAll("[\\p{Cntrl}]", "")
                .trim();

        if (fileName.isBlank()
                || ".".equals(fileName)
                || "..".equals(fileName)) {

            return "avatar" + extension;
        }

        if (fileName.length() > 255) {
            fileName = fileName.substring(
                    fileName.length() - 255);
        }

        return fileName;
    }

    /**
     * Registers cleanup actions for avatar replacement.
     *
     * On commit, the previous GridFS file is removed.
     * On rollback, the newly uploaded file is removed.
     *
     * @param newMongoFileId      identifier of the new image
     * @param previousMongoFileId identifier of the previous image
     */
    private void registerReplacementCleanup(
            String newMongoFileId,
            String previousMongoFileId) {

        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {

                    @Override
                    public void afterCompletion(int status) {

                        if (status == STATUS_COMMITTED) {

                            if (previousMongoFileId != null) {
                                deleteGridFsFileSafely(
                                        previousMongoFileId);
                            }

                        } else {
                            deleteGridFsFileSafely(
                                    newMongoFileId);
                        }
                    }
                });
    }

    /**
     * Schedules GridFS deletion after a successful
     * MySQL transaction commit.
     *
     * @param mongoFileId identifier of the image to delete
     */
    private void registerDeletionAfterCommit(String mongoFileId) {

        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {

                    @Override
                    public void afterCommit() {
                        deleteGridFsFileSafely(mongoFileId);
                    }
                });
    }

    /**
     * Attempts to delete an image from MongoDB GridFS
     * without propagating cleanup errors.
     *
     * @param mongoFileId identifier of the image
     */
    private void deleteGridFsFileSafely(String mongoFileId) {

        try {
            mongoFileStorageService.deleteFile(
                    GridFsBucketType.USER_AVATARS,
                    mongoFileId);

        } catch (RuntimeException exception) {

            log.warn(
                    "Failed to delete avatar file from GridFS: {}",
                    mongoFileId,
                    exception);
        }
    }

    /**
     * Converts an avatar entity into its response DTO.
     *
     * @param avatar avatar entity
     * @return avatar metadata response
     */
    private UserAvatarResponse convertToResponse(
            UserAvatarModel avatar) {

        return new UserAvatarResponse(
                avatar.getIdAvatar(),
                avatar.getUser().getIdUser(),
                avatar.getFileName(),
                avatar.getContentType(),
                avatar.getFileSize(),
                avatar.getCreatedAt(),
                avatar.getUpdatedAt());
    }
}
