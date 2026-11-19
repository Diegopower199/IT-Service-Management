
-- ============================================================
-- HELP DESK - DATABASE CREATION
-- ============================================================

-- 1. CREATE USER
CREATE USER IF NOT EXISTS 'helpdesk'@'localhost'
IDENTIFIED BY 'diegopower';

-- 2. CREATE DATABASE
CREATE DATABASE IF NOT EXISTS helpdesk
CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;

-- 3. GRANT PRIVILEGES
GRANT ALL PRIVILEGES ON helpdesk.*
TO 'helpdesk'@'localhost';

-- 4. REFRESH PRIVILEGES
FLUSH PRIVILEGES;

-- 5. SELECT DATABASE
USE helpdesk;

-- 6. VERIFY DATABASE
SHOW CREATE DATABASE helpdesk;
