package com.example.back_end.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.back_end.model.UserAvatarModel;

/**
 * Repository for managing user avatar metadata in MySQL.
 *
 * Provides persistence operations and allows retrieving
 * the avatar associated with a specific user.
 *
 * Image contents are stored separately in MongoDB GridFS.
 */
public interface UserAvatarRepository
        extends JpaRepository<UserAvatarModel, Long> {

    /**
     * Retrieves the avatar associated with a specific user.
     *
     * @param userId identifier of the user
     * @return an Optional containing the user's avatar, if present
     */
    Optional<UserAvatarModel> findByUser_IdUser(Long userId);
}
