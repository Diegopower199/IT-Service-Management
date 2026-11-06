package com.example.back_end.enums;

/**
 * Identifies the MongoDB GridFS bucket used for file storage.
 *
 * Each value corresponds to a dedicated bucket configured
 * in MongoGridFsConfig.
 */
public enum GridFsBucketType {

    TICKET_FILES,
    TICKET_COMMENT_FILES,
    USER_AVATARS
}
