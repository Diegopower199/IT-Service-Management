-- ============================================================
-- HELP DESK / IT SERVICE MANAGEMENT - REFERENCE DATA
-- 02 - INITIAL REFERENCE DATA (MySQL 8.0+)
-- ============================================================
-- Run AFTER 01_create_tables.sql on a NEW/EMPTY schema.
-- Installs the catalogs used by the application.
-- No demo users, tickets, comments, or history are inserted here.
-- This installation seed is NOT idempotent: execute only once.
-- ============================================================

USE helpdesk;
SET NAMES utf8mb4;
START TRANSACTION;

-- ------------------------------------------------------------
-- 1. ROLES
-- System roles are fixed; do not add unimplemented roles.
-- ------------------------------------------------------------
INSERT INTO roles (name) VALUES
    ('ADMIN'),
    ('TECHNICIAN'),
    ('USER');

-- ------------------------------------------------------------
-- 2. DEPARTMENTS
-- ------------------------------------------------------------
INSERT INTO departments (name, active) VALUES
    ('IT', TRUE),
    ('Finance', TRUE),
    ('Human Resources', TRUE),
    ('Sales', TRUE),
    ('Marketing', TRUE),
    ('Legal', TRUE),
    ('Operations', TRUE),
    ('Security', TRUE),
    ('Customer Support', TRUE),
    ('Procurement', TRUE),
    ('Facilities', TRUE),
    ('Logistics', TRUE),
    ('Product Development', TRUE),
    ('Quality Assurance', TRUE);

-- ------------------------------------------------------------
-- 3. TICKET CATEGORIES
-- ------------------------------------------------------------
INSERT INTO categories (name, active) VALUES
    ('Hardware', TRUE),
    ('Software', TRUE),
    ('Network', TRUE),
    ('Access', TRUE),
    ('Security', TRUE),
    ('Email', TRUE),
    ('Printers and Scanners', TRUE),
    ('Mobile Devices', TRUE),
    ('Remote Access', TRUE),
    ('Cloud Services', TRUE),
    ('Backup and Recovery', TRUE),
    ('Collaboration Tools', TRUE),
    ('Databases', TRUE),
    ('Telephony', TRUE);

-- ------------------------------------------------------------
-- 4. PRIORITIES
-- The initial four are protected system priorities.
-- Additional values are custom priorities. The dashboard's
-- critical metric counts CRITICAL only; custom values have
-- generic UI colors unless the frontend is extended.
-- ------------------------------------------------------------
INSERT INTO priorities (name, active) VALUES
    ('LOW', TRUE),
    ('MEDIUM', TRUE),
    ('HIGH', TRUE),
    ('CRITICAL', TRUE),
    ('VERY_LOW', TRUE),
    ('URGENT', TRUE);

-- ------------------------------------------------------------
-- 5. STATUSES
-- The initial five are protected system statuses.
-- Additional values are custom statuses. Dashboard metrics
-- for OPEN and IN_PROGRESS do not include other statuses.
-- ------------------------------------------------------------
INSERT INTO statuses (name, active) VALUES
    ('OPEN', TRUE),
    ('IN_PROGRESS', TRUE),
    ('WAITING', TRUE),
    ('RESOLVED', TRUE),
    ('CLOSED', TRUE),
    ('PENDING_CUSTOMER', TRUE),
    ('PENDING_VENDOR', TRUE),
    ('CANCELLED', TRUE);

COMMIT;

-- ------------------------------------------------------------
-- 6. VERIFICATION (READ-ONLY)
-- ------------------------------------------------------------
SELECT 'roles' AS table_name, COUNT(*) AS total FROM roles
UNION ALL
SELECT 'departments', COUNT(*) FROM departments
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'priorities', COUNT(*) FROM priorities
UNION ALL
SELECT 'statuses', COUNT(*) FROM statuses;