
-- ============================================================
-- FILE STORAGE TABLES
-- ============================================================
-- Stores metadata for ticket attachments, ticket comment
-- attachments and user avatars.
--
-- Actual file contents are stored in MongoDB GridFS.
-- ============================================================

USE helpdesk;


-- ============================================================
-- 1. TICKET ATTACHMENTS
-- MongoDB GridFS bucket: ticket_files
-- ============================================================

CREATE TABLE IF NOT EXISTS ticket_attachments (
    id_attachment BIGINT NOT NULL AUTO_INCREMENT,
    id_ticket BIGINT NOT NULL,
    id_uploaded_by BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    mongo_file_id VARCHAR(24) NOT NULL,
    created_at DATETIME(6) NOT NULL,

    PRIMARY KEY (id_attachment),

    INDEX idx_ticket_attachments_ticket (id_ticket),

    UNIQUE KEY uq_ticket_attachments_mongo_file (mongo_file_id),

    CONSTRAINT fk_ticket_attachments_ticket
        FOREIGN KEY (id_ticket)
        REFERENCES tickets (id_ticket),

    CONSTRAINT fk_ticket_attachments_user
        FOREIGN KEY (id_uploaded_by)
        REFERENCES users (id_user)

) ENGINE=InnoDB;


-- ============================================================
-- 2. TICKET COMMENT ATTACHMENTS
-- MongoDB GridFS bucket: ticket_comment_files
-- ============================================================

CREATE TABLE IF NOT EXISTS ticket_comment_attachments (
    id_attachment BIGINT NOT NULL AUTO_INCREMENT,
    id_ticket_comment BIGINT NOT NULL,
    id_uploaded_by BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    mongo_file_id VARCHAR(24) NOT NULL,
    created_at DATETIME(6) NOT NULL,

    PRIMARY KEY (id_attachment),

    INDEX idx_ticket_comment_attachments_comment (id_ticket_comment),

    INDEX idx_ticket_comment_attachments_uploaded_by (id_uploaded_by),

    UNIQUE KEY uq_ticket_comment_attachments_mongo_file (mongo_file_id),

    CONSTRAINT fk_ticket_comment_attachments_comment
        FOREIGN KEY (id_ticket_comment)
        REFERENCES ticket_comments (id_comment),

    CONSTRAINT fk_ticket_comment_attachments_user
        FOREIGN KEY (id_uploaded_by)
        REFERENCES users (id_user)

) ENGINE=InnoDB;


-- ============================================================
-- 3. USER AVATARS
-- MongoDB GridFS bucket: user_avatars
-- ============================================================

CREATE TABLE IF NOT EXISTS user_avatars (
    id_avatar BIGINT NOT NULL AUTO_INCREMENT,
    id_user BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    mongo_file_id VARCHAR(24) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,

    PRIMARY KEY (id_avatar),

    UNIQUE KEY uq_user_avatars_user (id_user),

    UNIQUE KEY uq_user_avatars_mongo_file (mongo_file_id),

    CONSTRAINT fk_user_avatars_user
        FOREIGN KEY (id_user)
        REFERENCES users (id_user)

) ENGINE=InnoDB;
