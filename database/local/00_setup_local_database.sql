-- ============================================================
-- HELP DESK - LOCAL MYSQL DATABASE SETUP
-- MySQL 8.0+
-- Manual installation only
-- ============================================================

-- 1. CREATE DATABASE
CREATE DATABASE IF NOT EXISTS helpdesk
CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;

-- 2. VERIFY DATABASE
SHOW CREATE DATABASE helpdesk;