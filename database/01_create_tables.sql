-- ============================================================
-- HELP DESK / IT SERVICE MANAGEMENT - MySQL 8.0+
-- 01 - TABLE CREATION (schema v1.0)
-- ============================================================
-- Run AFTER 00_create_database.sql, on a NEW/EMPTY schema.
-- Tables and column names follow the JPA entities in the backend.
-- Deliberately no DROP TABLE and no CREATE TABLE IF NOT EXISTS:
-- existing tables trigger an error instead of hiding schema drift.
-- ============================================================

USE helpdesk;

-- ------------------------------------------------------------
-- 1. LOOKUP TABLES
-- ------------------------------------------------------------
-- RoleModel has NO 'active' field. Other lookups have 'active'.

CREATE TABLE roles (
    id_role BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY (id_role),
    CONSTRAINT uq_roles_name UNIQUE (name)
) ENGINE=InnoDB;

CREATE TABLE departments (
    id_department BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id_department),
    CONSTRAINT uq_departments_name UNIQUE (name)
) ENGINE=InnoDB;

CREATE TABLE categories (
    id_category BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id_category),
    CONSTRAINT uq_categories_name UNIQUE (name)
) ENGINE=InnoDB;

CREATE TABLE priorities (
    id_priority BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id_priority),
    CONSTRAINT uq_priorities_name UNIQUE (name)
) ENGINE=InnoDB;

CREATE TABLE statuses (
    id_status BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (id_status),
    CONSTRAINT uq_statuses_name UNIQUE (name)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. USERS AND AUTHENTICATION
-- ------------------------------------------------------------

CREATE TABLE users (
    id_user BIGINT NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    enabled TINYINT(1) NOT NULL DEFAULT 1,
    id_role BIGINT NOT NULL,
    id_department BIGINT NOT NULL,
    PRIMARY KEY (id_user),
    CONSTRAINT uq_users_username UNIQUE (username),
    CONSTRAINT uq_users_email UNIQUE (email),
    INDEX idx_users_role (id_role),
    INDEX idx_users_department (id_department),
    CONSTRAINT FK_users_roles FOREIGN KEY (id_role) REFERENCES roles (id_role),
    CONSTRAINT FK_users_departments FOREIGN KEY (id_department) REFERENCES departments (id_department)
) ENGINE=InnoDB;

CREATE TABLE refresh_tokens (
    id_refresh_token BIGINT NOT NULL AUTO_INCREMENT,
    token_hash VARCHAR(64) NOT NULL,
    id_user BIGINT NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    revoked TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (id_refresh_token),
    CONSTRAINT uq_refresh_tokens_hash UNIQUE (token_hash),
    INDEX idx_refresh_tokens_user (id_user),
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (id_user) REFERENCES users (id_user)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. TICKETS
-- ------------------------------------------------------------

CREATE TABLE tickets (
    id_ticket BIGINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    last_updated DATETIME(6) NOT NULL,
    id_created_by BIGINT NOT NULL,
    id_requested_for BIGINT NOT NULL,
    id_assigned_to BIGINT NULL,
    id_category BIGINT NOT NULL,
    id_priority BIGINT NOT NULL,
    id_status BIGINT NOT NULL,
    PRIMARY KEY (id_ticket),
    INDEX idx_tickets_created_by (id_created_by),
    INDEX idx_tickets_requested_for (id_requested_for),
    INDEX idx_tickets_assigned_to (id_assigned_to),
    INDEX idx_tickets_category (id_category),
    INDEX idx_tickets_priority (id_priority),
    INDEX idx_tickets_status (id_status),
    INDEX idx_tickets_last_updated (last_updated),
    CONSTRAINT FK_ticket_created_by FOREIGN KEY (id_created_by) REFERENCES users (id_user),
    CONSTRAINT FK_ticket_requested_for FOREIGN KEY (id_requested_for) REFERENCES users (id_user),
    CONSTRAINT FK_ticket_assigned_to FOREIGN KEY (id_assigned_to) REFERENCES users (id_user),
    CONSTRAINT FK_ticket_category FOREIGN KEY (id_category) REFERENCES categories (id_category),
    CONSTRAINT FK_ticket_priority FOREIGN KEY (id_priority) REFERENCES priorities (id_priority),
    CONSTRAINT FK_ticket_status FOREIGN KEY (id_status) REFERENCES statuses (id_status)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. TICKET CONVERSATIONS AND AUDIT TRAIL
-- ------------------------------------------------------------

CREATE TABLE ticket_comments (
    id_comment BIGINT NOT NULL AUTO_INCREMENT,
    id_ticket BIGINT NOT NULL,
    id_user BIGINT NOT NULL,
    comment TEXT NOT NULL,
    internal TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id_comment),
    INDEX idx_ticket_comments_ticket_created (id_ticket, created_at),
    INDEX idx_ticket_comments_user (id_user),
    CONSTRAINT fk_ticket_comments_ticket FOREIGN KEY (id_ticket) REFERENCES tickets (id_ticket),
    CONSTRAINT fk_ticket_comments_user FOREIGN KEY (id_user) REFERENCES users (id_user)
) ENGINE=InnoDB;

CREATE TABLE ticket_history (
    id_history BIGINT NOT NULL AUTO_INCREMENT,
    id_ticket BIGINT NOT NULL,
    id_user BIGINT NOT NULL,
    action ENUM(
        'TICKET_CREATED',
        'TITLE_CHANGED',
        'DESCRIPTION_CHANGED',
        'CATEGORY_CHANGED',
        'PRIORITY_CHANGED',
        'STATUS_CHANGED',
        'ASSIGNED',
        'REASSIGNED'
    ) NOT NULL,
    field_name VARCHAR(255) NULL,
    old_value VARCHAR(255) NULL,
    new_value VARCHAR(255) NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id_history),
    INDEX idx_ticket_history_ticket_created (id_ticket, created_at),
    INDEX idx_ticket_history_user (id_user),
    CONSTRAINT fk_ticket_history_ticket FOREIGN KEY (id_ticket) REFERENCES tickets (id_ticket),
    CONSTRAINT fk_ticket_history_user FOREIGN KEY (id_user) REFERENCES users (id_user)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5. SCHEMA VERIFICATION
-- ------------------------------------------------------------
SHOW TABLES;
