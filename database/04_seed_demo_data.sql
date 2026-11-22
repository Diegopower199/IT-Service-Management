-- ============================================================
-- HELP DESK / IT SERVICE MANAGEMENT - DEMO DATA
-- 04 - DEMO DATA (MySQL 8.0+)
-- ============================================================
-- Run AFTER 03_seed_admin.sql on a NEW/EMPTY schema.
-- Creates 15 demo accounts, 60 tickets, comments and history.
-- Does not recreate reference catalogs.
-- NOT idempotent: execute only once; NEVER against production.
-- Each account has a verified BCrypt hash (never plaintext).
-- For local development and controlled demos. Restrict admin_demo before public deployment.
-- Ticket IDs 1..60 are explicit, referenced by the fixtures.
-- ============================================================

USE helpdesk;
SET NAMES utf8mb4;
START TRANSACTION;

-- ------------------------------------------------------------
-- 1. LOOKUP IDs BY NAME (never depend on lookup AUTO_INCREMENT)
-- ------------------------------------------------------------
SET @role_admin = (SELECT id_role FROM roles WHERE name = 'ADMIN');
SET @role_technician = (SELECT id_role FROM roles WHERE name = 'TECHNICIAN');
SET @role_user = (SELECT id_role FROM roles WHERE name = 'USER');
SET @department_it = (SELECT id_department FROM departments WHERE name = 'IT');
SET @department_finance = (SELECT id_department FROM departments WHERE name = 'Finance');
SET @department_human_resources = (SELECT id_department FROM departments WHERE name = 'Human Resources');
SET @department_sales = (SELECT id_department FROM departments WHERE name = 'Sales');
SET @department_marketing = (SELECT id_department FROM departments WHERE name = 'Marketing');
SET @department_legal = (SELECT id_department FROM departments WHERE name = 'Legal');
SET @department_operations = (SELECT id_department FROM departments WHERE name = 'Operations');
SET @department_security = (SELECT id_department FROM departments WHERE name = 'Security');
SET @department_customer_support = (SELECT id_department FROM departments WHERE name = 'Customer Support');
SET @department_procurement = (SELECT id_department FROM departments WHERE name = 'Procurement');
SET @department_product_development = (SELECT id_department FROM departments WHERE name = 'Product Development');
SET @category_hardware = (SELECT id_category FROM categories WHERE name = 'Hardware');
SET @category_software = (SELECT id_category FROM categories WHERE name = 'Software');
SET @category_network = (SELECT id_category FROM categories WHERE name = 'Network');
SET @category_access = (SELECT id_category FROM categories WHERE name = 'Access');
SET @category_security = (SELECT id_category FROM categories WHERE name = 'Security');
SET @category_email = (SELECT id_category FROM categories WHERE name = 'Email');
SET @category_printers_scanners = (SELECT id_category FROM categories WHERE name = 'Printers and Scanners');
SET @category_mobile_devices = (SELECT id_category FROM categories WHERE name = 'Mobile Devices');
SET @category_remote_access = (SELECT id_category FROM categories WHERE name = 'Remote Access');
SET @category_cloud_services = (SELECT id_category FROM categories WHERE name = 'Cloud Services');
SET @category_backup_recovery = (SELECT id_category FROM categories WHERE name = 'Backup and Recovery');
SET @category_collaboration_tools = (SELECT id_category FROM categories WHERE name = 'Collaboration Tools');
SET @category_databases = (SELECT id_category FROM categories WHERE name = 'Databases');
SET @category_telephony = (SELECT id_category FROM categories WHERE name = 'Telephony');
SET @priority_low = (SELECT id_priority FROM priorities WHERE name = 'LOW');
SET @priority_medium = (SELECT id_priority FROM priorities WHERE name = 'MEDIUM');
SET @priority_high = (SELECT id_priority FROM priorities WHERE name = 'HIGH');
SET @priority_critical = (SELECT id_priority FROM priorities WHERE name = 'CRITICAL');
SET @priority_very_low = (SELECT id_priority FROM priorities WHERE name = 'VERY_LOW');
SET @priority_urgent = (SELECT id_priority FROM priorities WHERE name = 'URGENT');
SET @status_open = (SELECT id_status FROM statuses WHERE name = 'OPEN');
SET @status_in_progress = (SELECT id_status FROM statuses WHERE name = 'IN_PROGRESS');
SET @status_blocked = (SELECT id_status FROM statuses WHERE name = 'BLOCKED');
SET @status_resolved = (SELECT id_status FROM statuses WHERE name = 'RESOLVED');
SET @status_closed = (SELECT id_status FROM statuses WHERE name = 'CLOSED');

-- ------------------------------------------------------------
-- 2. USERS (individual BCrypt password hashes)
-- ------------------------------------------------------------
-- Public demo accounts: admin_demo / technician_demo / user_demo.
-- Additional accounts: tech.sofia / tech.mario / user.pablo / user.lucia, etc.
-- 15 demo users total; the private admin is created by 03_seed_admin.sql.
-- Store demo passwords outside SQL; the script includes only BCrypt hashes.
INSERT INTO users
    (username, email, password, first_name, last_name, enabled, id_role, id_department)
VALUES
    ('admin_demo', 'admin_demo@company.test', '$2a$10$Tz5UHpPQq53AYKhwG3tKBOnPi4W4LKzljxao0WQ2w.HeTstRINcKG', 'Demo', 'Administrator', TRUE, @role_admin, @department_it),
    ('technician_demo', 'technician_demo@company.test', '$2a$10$eUA5hgYxYDsNyxiA/5e8aOhe2r94/jqxi2uTuhcIATN3jQIBH6cUC', 'Demo', 'Technician', TRUE, @role_technician, @department_it),
    ('user_demo', 'user_demo@company.test', '$2a$10$GdfbvKUqXd05RswwG2fTLuT/DJDYr5D4DBnTT..yoSwrSjZqTGZXq', 'Demo', 'User', TRUE, @role_user, @department_finance),
    ('tech.sofia', 'tech.sofia@company.test', '$2a$10$4uOvNKjgEoulF1pyrczz.eqynr0OzABrRNvff0A.o45pfMUOoqht6', 'Sofia', 'Lopez', TRUE, @role_technician, @department_it),
    ('tech.mario', 'tech.mario@company.test', '$2a$10$pkBTDJmwt8TpXK/HUp3NduoTsxHFY2lRY.kCv.GbzuN8ZIF8Kk3lu', 'Mario', 'Ruiz', TRUE, @role_technician, @department_security),
    ('user.pablo', 'user.pablo@company.test', '$2a$10$ttslzffTmpvVqNeXSUVZPO/.XYbF8Olrjpl5tU4fuUtmijWnHz5J.', 'Pablo', 'Santos', TRUE, @role_user, @department_sales),
    ('user.lucia', 'user.lucia@company.test', '$2a$10$P.uQtXSOMFljMRBT3jzQeOi1.wuTMpQxYkaRTlKw.sdLNR8a9472G', 'Lucia', 'Martin', TRUE, @role_user, @department_human_resources),
    ('tech.daniel', 'tech.daniel@company.test', '$2a$10$8oF1c77R1r9CJDoPL/hjcecFsMTbS0OI5ddw4ezGNhnA0bDBjd/8S', 'Daniel', 'Moreno', TRUE, @role_technician, @department_it),
    ('tech.elena', 'tech.elena@company.test', '$2a$10$G/gskkSEZV6KNqEwNC9pp.TxJ/cPi6JheWq6mRdUGYGrYC1.ntdp6', 'Elena', 'Vega', TRUE, @role_technician, @department_security),
    ('user.marta', 'user.marta@company.test', '$2a$10$jqcyywpL/r0tYEijzgWM1OvzP9JjDjKS8kdgi8C2LQMkrjGVk0Mf6', 'Marta', 'Navarro', TRUE, @role_user, @department_marketing),
    ('user.javier', 'user.javier@company.test', '$2a$10$oYgwuQBus51RWj1rDpY0DetFxldxjBKWzUwD8ISd1UxMDUPBucpoO', 'Javier', 'Torres', TRUE, @role_user, @department_legal),
    ('user.sara', 'user.sara@company.test', '$2a$10$v42Pa5ozDSiTSfqwfhu8Weer.Iq2EUKxQyB6lpLoJLXoPGlEnl4AG', 'Sara', 'Romero', TRUE, @role_user, @department_operations),
    ('user.alberto', 'user.alberto@company.test', '$2a$10$mECSbDvsKMvDT6fBPTz1QObTwqkN6eopOcco.xjpGj3Zg4Uy5PWxi', 'Alberto', 'Molina', TRUE, @role_user, @department_customer_support),
    ('user.clara', 'user.clara@company.test', '$2a$10$zTodkxA1KP5AWWNmZfv93OIRiWMGLNWN6vm5Yj7CmH1Y1VQWeWXpe', 'Clara', 'Fernandez', TRUE, @role_user, @department_procurement),
    ('user.david', 'user.david@company.test', '$2a$10$b/44RU838swtCs6c3U36S.3Sn92s7S48sidg4uX4Znxi9QhXPNP4G', 'David', 'Ortega', TRUE, @role_user, @department_product_development);

SET @admin_demo = (SELECT id_user FROM users WHERE username = 'admin_demo');
SET @technician_demo = (SELECT id_user FROM users WHERE username = 'technician_demo');
SET @user_demo = (SELECT id_user FROM users WHERE username = 'user_demo');
SET @sofia = (SELECT id_user FROM users WHERE username = 'tech.sofia');
SET @mario = (SELECT id_user FROM users WHERE username = 'tech.mario');
SET @pablo = (SELECT id_user FROM users WHERE username = 'user.pablo');
SET @lucia = (SELECT id_user FROM users WHERE username = 'user.lucia');
SET @daniel = (SELECT id_user FROM users WHERE username = 'tech.daniel');
SET @elena = (SELECT id_user FROM users WHERE username = 'tech.elena');
SET @marta = (SELECT id_user FROM users WHERE username = 'user.marta');
SET @javier = (SELECT id_user FROM users WHERE username = 'user.javier');
SET @sara = (SELECT id_user FROM users WHERE username = 'user.sara');
SET @alberto = (SELECT id_user FROM users WHERE username = 'user.alberto');
SET @clara = (SELECT id_user FROM users WHERE username = 'user.clara');
SET @david = (SELECT id_user FROM users WHERE username = 'user.david');

-- ------------------------------------------------------------
-- 3. TICKETS
-- ------------------------------------------------------------
-- Core demo users have tickets across the workflow; additional users
-- provide assignment, permissions, and department-specific scenarios.
-- Custom statuses/priorities demonstrate configurable catalogs but are
-- not included in all dashboard statistics or UI translations.
-- A NULL assigned user represents an unassigned ticket.
INSERT INTO tickets
    (id_ticket, title, description, created_at, last_updated,
     id_created_by, id_requested_for, id_assigned_to, id_category, id_priority, id_status)
VALUES
    (1, 'Critical access to administration portal', 'The administrator cannot access the corporate administration portal.', DATE_SUB(NOW(), INTERVAL 24 HOUR), DATE_SUB(NOW(), INTERVAL 18 HOUR), @admin_demo, @admin_demo, NULL, @category_access, @priority_critical, @status_open),
    (2, 'Administrative security permissions issue', 'Some administrative permissions are not working correctly.', DATE_SUB(NOW(), INTERVAL 72 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR), @admin_demo, @admin_demo, @technician_demo, @category_security, @priority_high, @status_in_progress),
    (3, 'Administration software update pending', 'A required administration software update is waiting for approval.', DATE_SUB(NOW(), INTERVAL 96 HOUR), DATE_SUB(NOW(), INTERVAL 6 HOUR), @admin_demo, @admin_demo, @sofia, @category_software, @priority_medium, @status_blocked),
    (4, 'Administrative VPN problem resolved', 'The VPN connection used by the administrator has been restored.', DATE_SUB(NOW(), INTERVAL 168 HOUR), DATE_SUB(NOW(), INTERVAL 48 HOUR), @admin_demo, @admin_demo, @sofia, @category_network, @priority_medium, @status_resolved),
    (5, 'Administrative email configuration', 'A minor email configuration problem was resolved and closed.', DATE_SUB(NOW(), INTERVAL 240 HOUR), DATE_SUB(NOW(), INTERVAL 120 HOUR), @admin_demo, @admin_demo, @technician_demo, @category_email, @priority_low, @status_closed),
    (6, 'Security console unavailable', 'The technician cannot access the corporate security console.', DATE_SUB(NOW(), INTERVAL 24 HOUR), DATE_SUB(NOW(), INTERVAL 16 HOUR), @technician_demo, @technician_demo, NULL, @category_security, @priority_critical, @status_open),
    (7, 'Technician network connectivity problem', 'The technician workstation has intermittent network connectivity.', DATE_SUB(NOW(), INTERVAL 72 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR), @technician_demo, @technician_demo, @technician_demo, @category_network, @priority_high, @status_in_progress),
    (8, 'Support software license pending', 'The technician is waiting for approval of a support software license.', DATE_SUB(NOW(), INTERVAL 120 HOUR), DATE_SUB(NOW(), INTERVAL 8 HOUR), @technician_demo, @technician_demo, @sofia, @category_software, @priority_medium, @status_blocked),
    (9, 'Technician email synchronization resolved', 'The email synchronization problem has been resolved.', DATE_SUB(NOW(), INTERVAL 168 HOUR), DATE_SUB(NOW(), INTERVAL 48 HOUR), @technician_demo, @technician_demo, @technician_demo, @category_email, @priority_medium, @status_resolved),
    (10, 'Technician monitor configuration', 'The secondary monitor configuration was corrected and the ticket was closed.', DATE_SUB(NOW(), INTERVAL 240 HOUR), DATE_SUB(NOW(), INTERVAL 96 HOUR), @technician_demo, @technician_demo, @mario, @category_hardware, @priority_low, @status_closed),
    (11, 'Suspicious login detected', 'The user received a login notification from an unknown location.', DATE_SUB(NOW(), INTERVAL 24 HOUR), DATE_SUB(NOW(), INTERVAL 18 HOUR), @user_demo, @user_demo, NULL, @category_security, @priority_critical, @status_open),
    (12, 'Corporate VPN connection failure', 'The user cannot connect to the corporate VPN while working remotely.', DATE_SUB(NOW(), INTERVAL 72 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR), @user_demo, @user_demo, @technician_demo, @category_network, @priority_high, @status_in_progress),
    (13, 'Excel report application error', 'Excel closes unexpectedly when opening a specific report.', DATE_SUB(NOW(), INTERVAL 96 HOUR), DATE_SUB(NOW(), INTERVAL 24 HOUR), @user_demo, @user_demo, @technician_demo, @category_software, @priority_medium, @status_blocked),
    (14, 'Password access problem resolved', 'The user password was reset and access has been restored.', DATE_SUB(NOW(), INTERVAL 144 HOUR), DATE_SUB(NOW(), INTERVAL 48 HOUR), @user_demo, @user_demo, @sofia, @category_access, @priority_medium, @status_resolved),
    (15, 'Keyboard replacement completed', 'The defective keyboard was replaced and the incident was closed.', DATE_SUB(NOW(), INTERVAL 216 HOUR), DATE_SUB(NOW(), INTERVAL 96 HOUR), @user_demo, @user_demo, @technician_demo, @category_hardware, @priority_low, @status_closed),
    (16, 'Sales laptop running slowly', 'The laptop used by the sales team is very slow when opening CRM reports.', DATE_SUB(NOW(), INTERVAL 48 HOUR), DATE_SUB(NOW(), INTERVAL 36 HOUR), @pablo, @pablo, NULL, @category_hardware, @priority_medium, @status_open),
    (17, 'Sales MFA prompts repeatedly', 'Multi-factor authentication prompts appear repeatedly when accessing the CRM.', DATE_SUB(NOW(), INTERVAL 72 HOUR), DATE_SUB(NOW(), INTERVAL 6 HOUR), @pablo, @pablo, @mario, @category_access, @priority_high, @status_in_progress),
    (18, 'Human Resources mailbox restored', 'The Human Resources shared mailbox can send and receive messages again.', DATE_SUB(NOW(), INTERVAL 96 HOUR), DATE_SUB(NOW(), INTERVAL 48 HOUR), @lucia, @lucia, @sofia, @category_email, @priority_medium, @status_resolved),
    (19, 'SSO login failure for cloud administration', 'Several administrators receive a sign-in error when opening the cloud management console.', DATE_SUB(NOW(), INTERVAL 72 HOUR), DATE_SUB(NOW(), INTERVAL 5 HOUR), @admin_demo, @admin_demo, @elena, @category_cloud_services, @priority_critical, @status_in_progress),
    (20, 'Nightly backup report missing', 'The latest infrastructure backup report has not reached the administrators mailbox.', DATE_SUB(NOW(), INTERVAL 18 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR), @admin_demo, @admin_demo, NULL, @category_backup_recovery, @priority_high, @status_open),
    (21, 'Database maintenance requires approval', 'The planned database index maintenance cannot proceed until the change window is approved.', DATE_SUB(NOW(), INTERVAL 144 HOUR), DATE_SUB(NOW(), INTERVAL 11 HOUR), @admin_demo, @admin_demo, @daniel, @category_databases, @priority_medium, @status_blocked),
    (22, 'Teams guest invitation problem', 'External guests were unable to join a project workspace using their invitation links.', DATE_SUB(NOW(), INTERVAL 480 HOUR), DATE_SUB(NOW(), INTERVAL 36 HOUR), @admin_demo, @admin_demo, @sofia, @category_collaboration_tools, @priority_low, @status_closed),
    (23, 'Endpoint protection console alerts delayed', 'Critical endpoint security alerts appear several hours late in the management console.', DATE_SUB(NOW(), INTERVAL 96 HOUR), DATE_SUB(NOW(), INTERVAL 7 HOUR), @admin_demo, @admin_demo, @mario, @category_security, @priority_urgent, @status_blocked),
    (24, 'Office DNS lookup failures', 'Several workstations intermittently failed to resolve internal application hostnames.', DATE_SUB(NOW(), INTERVAL 240 HOUR), DATE_SUB(NOW(), INTERVAL 18 HOUR), @admin_demo, @admin_demo, @technician_demo, @category_network, @priority_high, @status_resolved),
    (25, 'IT inventory scanner not detecting laptops', 'The asset inventory scanner is missing recently deployed company laptops.', DATE_SUB(NOW(), INTERVAL 84 HOUR), DATE_SUB(NOW(), INTERVAL 6 HOUR), @admin_demo, @admin_demo, @daniel, @category_hardware, @priority_medium, @status_in_progress),
    (26, 'Temporary permissions for retired portal', 'A temporary access request was raised for a portal that is being retired.', DATE_SUB(NOW(), INTERVAL 360 HOUR), DATE_SUB(NOW(), INTERVAL 27 HOUR), @admin_demo, @admin_demo, NULL, @category_access, @priority_very_low, @status_closed),
    (27, 'Unusual firewall events on support subnet', 'The service desk subnet is generating unexpected firewall deny events.', DATE_SUB(NOW(), INTERVAL 60 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR), @technician_demo, @technician_demo, @mario, @category_security, @priority_high, @status_in_progress),
    (28, 'Shared printer driver deployment blocked', 'The print server is rejecting the latest shared printer driver package.', DATE_SUB(NOW(), INTERVAL 110 HOUR), DATE_SUB(NOW(), INTERVAL 8 HOUR), @technician_demo, @technician_demo, @daniel, @category_printers_scanners, @priority_medium, @status_blocked),
    (29, 'Monitoring agent disconnected from cloud instance', 'A cloud-hosted support instance stopped sending heartbeat metrics.', DATE_SUB(NOW(), INTERVAL 320 HOUR), DATE_SUB(NOW(), INTERVAL 24 HOUR), @technician_demo, @technician_demo, @sofia, @category_cloud_services, @priority_high, @status_resolved),
    (30, 'Update service desk remote support tool', 'The remote assistance utility required an update to the approved version.', DATE_SUB(NOW(), INTERVAL 420 HOUR), DATE_SUB(NOW(), INTERVAL 32 HOUR), @technician_demo, @technician_demo, @technician_demo, @category_software, @priority_low, @status_closed),
    (31, 'Support phone cannot sync contacts', 'The shared service desk phone stopped synchronizing the corporate address book.', DATE_SUB(NOW(), INTERVAL 12 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR), @technician_demo, @technician_demo, NULL, @category_mobile_devices, @priority_medium, @status_open),
    (32, 'Restore test requires data owner confirmation', 'A restore test has produced recovered files that need business-owner validation.', DATE_SUB(NOW(), INTERVAL 48 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR), @technician_demo, @technician_demo, @elena, @category_backup_recovery, @priority_critical, @status_blocked),
    (33, 'Service desk reports timing out', 'Ticket reporting queries are unusually slow during office hours.', DATE_SUB(NOW(), INTERVAL 200 HOUR), DATE_SUB(NOW(), INTERVAL 15 HOUR), @technician_demo, @technician_demo, @daniel, @category_databases, @priority_medium, @status_in_progress),
    (34, 'Remote assistance session fails to connect', 'The remote support application cannot connect to certain employee computers.', DATE_SUB(NOW(), INTERVAL 160 HOUR), DATE_SUB(NOW(), INTERVAL 12 HOUR), @technician_demo, @technician_demo, @sofia, @category_remote_access, @priority_high, @status_resolved),
    (35, 'Finance scanner adds blank pages', 'The document scanner in Finance inserts blank pages into multi-page scans.', DATE_SUB(NOW(), INTERVAL 20 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR), @user_demo, @user_demo, NULL, @category_printers_scanners, @priority_low, @status_open),
    (36, 'Invoice emails not reaching suppliers', 'Several invoice emails sent from Finance are being rejected by external recipients.', DATE_SUB(NOW(), INTERVAL 56 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR), @user_demo, @user_demo, @technician_demo, @category_email, @priority_high, @status_in_progress),
    (37, 'Cannot open shared meeting notes', 'A shared project meeting notebook is inaccessible to some team members.', DATE_SUB(NOW(), INTERVAL 120 HOUR), DATE_SUB(NOW(), INTERVAL 9 HOUR), @user_demo, @user_demo, @sofia, @category_collaboration_tools, @priority_medium, @status_blocked),
    (38, 'Finance laptop battery replacement', 'A finance laptop battery was draining within an hour of use.', DATE_SUB(NOW(), INTERVAL 700 HOUR), DATE_SUB(NOW(), INTERVAL 52 HOUR), @user_demo, @user_demo, @daniel, @category_hardware, @priority_low, @status_closed),
    (39, 'MFA recovery after phone replacement', 'Finance lost access to a business app after the registered authenticator phone was replaced.', DATE_SUB(NOW(), INTERVAL 280 HOUR), DATE_SUB(NOW(), INTERVAL 21 HOUR), @user_demo, @user_demo, @elena, @category_security, @priority_critical, @status_resolved),
    (40, 'Calendar missing from work phone', 'The corporate calendar is not visible in the managed phone calendar application.', DATE_SUB(NOW(), INTERVAL 64 HOUR), DATE_SUB(NOW(), INTERVAL 5 HOUR), @user_demo, @user_demo, @technician_demo, @category_mobile_devices, @priority_medium, @status_blocked),
    (41, 'New finance application access denied', 'The finance reporting application denies access despite the users approved role.', DATE_SUB(NOW(), INTERVAL 96 HOUR), DATE_SUB(NOW(), INTERVAL 7 HOUR), @user_demo, @user_demo, @mario, @category_access, @priority_high, @status_in_progress),
    (42, 'Request for unused desk phone extension', 'A telephone extension was requested for a desk that will remain unoccupied.', DATE_SUB(NOW(), INTERVAL 220 HOUR), DATE_SUB(NOW(), INTERVAL 16 HOUR), @user_demo, @user_demo, NULL, @category_telephony, @priority_very_low, @status_closed),
    (43, 'CRM application freezes when saving deals', 'Sales staff see intermittent freezes when saving new opportunities in the CRM.', DATE_SUB(NOW(), INTERVAL 70 HOUR), DATE_SUB(NOW(), INTERVAL 5 HOUR), @pablo, @pablo, @daniel, @category_software, @priority_high, @status_in_progress),
    (44, 'Sales softphone drops incoming calls', 'The sales softphone was disconnecting incoming calls after a few seconds.', DATE_SUB(NOW(), INTERVAL 260 HOUR), DATE_SUB(NOW(), INTERVAL 20 HOUR), @pablo, @pablo, @mario, @category_telephony, @priority_medium, @status_resolved),
    (45, 'HR onboarding accounts missing permissions', 'New starters can sign in but cannot access the employee onboarding portal.', DATE_SUB(NOW(), INTERVAL 168 HOUR), DATE_SUB(NOW(), INTERVAL 13 HOUR), @lucia, @lucia, @sofia, @category_access, @priority_high, @status_blocked),
    (46, 'Shared HR mailbox search not working', 'Searches in the shared HR mailbox returned incomplete results.', DATE_SUB(NOW(), INTERVAL 430 HOUR), DATE_SUB(NOW(), INTERVAL 32 HOUR), @lucia, @lucia, @elena, @category_email, @priority_medium, @status_closed),
    (47, 'Marketing presentation permissions mismatch', 'The marketing team cannot edit shared presentation files in the campaign workspace.', DATE_SUB(NOW(), INTERVAL 108 HOUR), DATE_SUB(NOW(), INTERVAL 8 HOUR), @marta, @marta, @daniel, @category_collaboration_tools, @priority_medium, @status_in_progress),
    (48, 'Campaign analytics export fails', 'The marketing analytics portal fails when exporting a weekly campaign report.', DATE_SUB(NOW(), INTERVAL 300 HOUR), DATE_SUB(NOW(), INTERVAL 22 HOUR), @marta, @marta, @sofia, @category_cloud_services, @priority_low, @status_resolved),
    (49, 'Confidential document access alert', 'The Legal team received an alert about attempted access to a restricted document.', DATE_SUB(NOW(), INTERVAL 36 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR), @javier, @javier, @elena, @category_security, @priority_critical, @status_in_progress),
    (50, 'Legal department printer produces faded text', 'Printed contracts have faint text even after changing the toner cartridge.', DATE_SUB(NOW(), INTERVAL 14 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR), @javier, @javier, NULL, @category_printers_scanners, @priority_low, @status_open),
    (51, 'Warehouse Wi-Fi access points rebooting', 'Operations reports repeated Wi-Fi interruptions near the warehouse dispatch area.', DATE_SUB(NOW(), INTERVAL 150 HOUR), DATE_SUB(NOW(), INTERVAL 11 HOUR), @sara, @sara, @mario, @category_network, @priority_high, @status_blocked),
    (52, 'Operations report accidentally deleted', 'An operations performance report was removed from a shared folder.', DATE_SUB(NOW(), INTERVAL 360 HOUR), DATE_SUB(NOW(), INTERVAL 27 HOUR), @sara, @sara, @daniel, @category_backup_recovery, @priority_medium, @status_resolved),
    (53, 'Customer support VPN drops active calls', 'The VPN connection disconnects while customer support staff use the calling application.', DATE_SUB(NOW(), INTERVAL 44 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR), @alberto, @alberto, @technician_demo, @category_remote_access, @priority_high, @status_in_progress),
    (54, 'Call queue greeting not updating', 'Customer support updated the greeting, but callers still hear the previous message.', DATE_SUB(NOW(), INTERVAL 180 HOUR), DATE_SUB(NOW(), INTERVAL 14 HOUR), @alberto, @alberto, @sofia, @category_telephony, @priority_medium, @status_blocked),
    (55, 'Procurement vendor portal access', 'Procurement was unable to access the supplier onboarding portal.', DATE_SUB(NOW(), INTERVAL 540 HOUR), DATE_SUB(NOW(), INTERVAL 40 HOUR), @clara, @clara, @mario, @category_access, @priority_medium, @status_closed),
    (56, 'Purchase order barcode reader not detected', 'The USB barcode reader in Procurement was not recognised after a restart.', DATE_SUB(NOW(), INTERVAL 260 HOUR), DATE_SUB(NOW(), INTERVAL 20 HOUR), @clara, @clara, @daniel, @category_hardware, @priority_low, @status_resolved),
    (57, 'Development database access request', 'The product team requires read-only access to a non-production database.', DATE_SUB(NOW(), INTERVAL 112 HOUR), DATE_SUB(NOW(), INTERVAL 8 HOUR), @david, @david, @sofia, @category_databases, @priority_high, @status_blocked),
    (58, 'Staging deployment pipeline failing', 'A product release staging job repeatedly fails to deploy a build artifact.', DATE_SUB(NOW(), INTERVAL 50 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR), @david, @david, @elena, @category_cloud_services, @priority_critical, @status_in_progress),
    (59, 'Office network switch port errors', 'Repeated port errors caused sporadic connectivity for two IT workstations.', DATE_SUB(NOW(), INTERVAL 310 HOUR), DATE_SUB(NOW(), INTERVAL 23 HOUR), @daniel, @daniel, @mario, @category_network, @priority_medium, @status_resolved),
    (60, 'Remove deprecated antivirus management rule', 'An unused antivirus policy remained assigned to a retired endpoint group.', DATE_SUB(NOW(), INTERVAL 580 HOUR), DATE_SUB(NOW(), INTERVAL 44 HOUR), @elena, @elena, @technician_demo, @category_security, @priority_low, @status_closed);

-- ------------------------------------------------------------
-- 4. COMMENTS (public and internal), grouped by ticket
-- ------------------------------------------------------------
-- Ticket #1: Critical access to administration portal
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (1, @admin_demo, 'The administration portal is still unavailable.', FALSE, DATE_SUB(NOW(), INTERVAL 20 HOUR)),
    (1, @admin_demo, 'Authentication logs are being reviewed.', TRUE, DATE_SUB(NOW(), INTERVAL 18 HOUR));

-- Ticket #2: Administrative security permissions issue
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (2, @admin_demo, 'Administrative permissions are still failing.', FALSE, DATE_SUB(NOW(), INTERVAL 48 HOUR)),
    (2, @technician_demo, 'Reviewing the affected roles and access policies.', TRUE, DATE_SUB(NOW(), INTERVAL 24 HOUR)),
    (2, @technician_demo, 'The issue is currently under investigation.', FALSE, DATE_SUB(NOW(), INTERVAL 4 HOUR));

-- Ticket #3: Administration software update pending
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (3, @sofia, 'The software update requires vendor approval.', TRUE, DATE_SUB(NOW(), INTERVAL 36 HOUR)),
    (3, @admin_demo, 'Please let me know when the vendor confirms the update.', FALSE, DATE_SUB(NOW(), INTERVAL 12 HOUR));

-- Ticket #4: Administrative VPN problem resolved
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (4, @sofia, 'VPN configuration has been corrected.', FALSE, DATE_SUB(NOW(), INTERVAL 72 HOUR)),
    (4, @admin_demo, 'I have tested the VPN and it is working correctly now.', FALSE, DATE_SUB(NOW(), INTERVAL 48 HOUR));

-- Ticket #5: Administrative email configuration
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (5, @technician_demo, 'Email configuration was updated successfully.', FALSE, DATE_SUB(NOW(), INTERVAL 144 HOUR)),
    (5, @admin_demo, 'Confirmed. Everything is working correctly.', FALSE, DATE_SUB(NOW(), INTERVAL 120 HOUR));

-- Ticket #6: Security console unavailable
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (6, @technician_demo, 'The security console still returns an access error.', FALSE, DATE_SUB(NOW(), INTERVAL 20 HOUR)),
    (6, @admin_demo, 'Security permissions will be reviewed.', TRUE, DATE_SUB(NOW(), INTERVAL 16 HOUR));

-- Ticket #7: Technician network connectivity problem
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (7, @technician_demo, 'Network connectivity continues to be intermittent.', FALSE, DATE_SUB(NOW(), INTERVAL 48 HOUR)),
    (7, @technician_demo, 'Network logs show packet loss on this workstation.', TRUE, DATE_SUB(NOW(), INTERVAL 24 HOUR)),
    (7, @technician_demo, 'Network configuration is being reviewed.', FALSE, DATE_SUB(NOW(), INTERVAL 6 HOUR));

-- Ticket #8: Support software license pending
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (8, @technician_demo, 'Is there any update regarding the software license?', FALSE, DATE_SUB(NOW(), INTERVAL 48 HOUR)),
    (8, @sofia, 'License request has been submitted to the provider.', TRUE, DATE_SUB(NOW(), INTERVAL 24 HOUR)),
    (8, @sofia, 'We are waiting for provider approval.', FALSE, DATE_SUB(NOW(), INTERVAL 10 HOUR));

-- Ticket #9: Technician email synchronization resolved
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (9, @technician_demo, 'The Outlook profile has been rebuilt.', FALSE, DATE_SUB(NOW(), INTERVAL 72 HOUR)),
    (9, @technician_demo, 'Synchronization is working correctly now.', FALSE, DATE_SUB(NOW(), INTERVAL 48 HOUR));

-- Ticket #10: Technician monitor configuration
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (10, @mario, 'The secondary monitor is now working correctly.', FALSE, DATE_SUB(NOW(), INTERVAL 120 HOUR)),
    (10, @admin_demo, 'Issue confirmed as resolved. Closing ticket.', TRUE, DATE_SUB(NOW(), INTERVAL 96 HOUR));

-- Ticket #11: Suspicious login detected
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (11, @user_demo, 'I confirm that I did not perform this login.', FALSE, DATE_SUB(NOW(), INTERVAL 20 HOUR)),
    (11, @admin_demo, 'Potential account compromise; reviewing authentication logs.', TRUE, DATE_SUB(NOW(), INTERVAL 18 HOUR));

-- Ticket #12: Corporate VPN connection failure
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (12, @user_demo, 'The VPN still fails after entering my credentials.', FALSE, DATE_SUB(NOW(), INTERVAL 60 HOUR)),
    (12, @technician_demo, 'Possible VPN profile corruption; reviewing configuration.', TRUE, DATE_SUB(NOW(), INTERVAL 55 HOUR)),
    (12, @user_demo, 'I restarted the laptop but the problem continues.', FALSE, DATE_SUB(NOW(), INTERVAL 50 HOUR)),
    (12, @technician_demo, 'The user credentials appear to be valid.', TRUE, DATE_SUB(NOW(), INTERVAL 44 HOUR)),
    (12, @technician_demo, 'A new VPN profile has been generated.', FALSE, DATE_SUB(NOW(), INTERVAL 37 HOUR)),
    (12, @user_demo, 'I installed the profile but I still cannot connect.', FALSE, DATE_SUB(NOW(), INTERVAL 30 HOUR)),
    (12, @technician_demo, 'Checking firewall and network access rules.', TRUE, DATE_SUB(NOW(), INTERVAL 25 HOUR)),
    (12, @technician_demo, 'The firewall configuration looks correct.', TRUE, DATE_SUB(NOW(), INTERVAL 20 HOUR)),
    (12, @user_demo, 'The error message now says connection timed out.', FALSE, DATE_SUB(NOW(), INTERVAL 15 HOUR)),
    (12, @technician_demo, 'The VPN gateway configuration is being reviewed.', TRUE, DATE_SUB(NOW(), INTERVAL 10 HOUR)),
    (12, @technician_demo, 'Another VPN profile is being prepared.', FALSE, DATE_SUB(NOW(), INTERVAL 4 HOUR));

-- Ticket #13: Excel report application error
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (13, @user_demo, 'The error only happens with one specific Excel report.', FALSE, DATE_SUB(NOW(), INTERVAL 48 HOUR)),
    (13, @technician_demo, 'Waiting for the affected Excel document.', TRUE, DATE_SUB(NOW(), INTERVAL 24 HOUR));

-- Ticket #14: Password access problem resolved
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (14, @sofia, 'The password has been reset successfully.', FALSE, DATE_SUB(NOW(), INTERVAL 72 HOUR)),
    (14, @user_demo, 'I can access my account again. Thank you.', FALSE, DATE_SUB(NOW(), INTERVAL 48 HOUR));

-- Ticket #15: Keyboard replacement completed
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (15, @technician_demo, 'The defective keyboard has been replaced.', FALSE, DATE_SUB(NOW(), INTERVAL 120 HOUR)),
    (15, @user_demo, 'The new keyboard is working correctly.', FALSE, DATE_SUB(NOW(), INTERVAL 96 HOUR));

-- Ticket #16: Sales laptop running slowly
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (16, @pablo, 'The laptop is slow even after a restart.', FALSE, DATE_SUB(NOW(), INTERVAL 40 HOUR)),
    (16, @admin_demo, 'Hardware diagnostic pending technician assignment.', TRUE, DATE_SUB(NOW(), INTERVAL 36 HOUR));

-- Ticket #17: Sales MFA prompts repeatedly
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (17, @pablo, 'The MFA prompt appears every few minutes.', FALSE, DATE_SUB(NOW(), INTERVAL 48 HOUR)),
    (17, @mario, 'Checking sign-in and conditional access logs.', TRUE, DATE_SUB(NOW(), INTERVAL 24 HOUR)),
    (17, @mario, 'We are investigating the authentication flow.', FALSE, DATE_SUB(NOW(), INTERVAL 6 HOUR));

-- Ticket #18: Human Resources mailbox restored
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (18, @sofia, 'Shared mailbox permissions have been corrected.', FALSE, DATE_SUB(NOW(), INTERVAL 60 HOUR)),
    (18, @lucia, 'The mailbox is working correctly. Thank you.', FALSE, DATE_SUB(NOW(), INTERVAL 48 HOUR));

-- ------------------------------------------------------------
-- ADDITIONAL DEMO COMMENTS (TICKETS 19..60)
-- ------------------------------------------------------------
-- Ticket #19: SSO login failure for cloud administration
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (19, @admin_demo, 'Could someone investigate this issue? Several administrators receive a sign-in error when opening the cloud management console.', FALSE, DATE_SUB(NOW(), INTERVAL 64 HOUR)),
    (19, @elena, 'Identity provider responses are intermittently failing for administrator accounts.', TRUE, DATE_SUB(NOW(), INTERVAL 35 HOUR)),
    (19, @elena, 'The authentication team is testing an updated SSO configuration.', FALSE, DATE_SUB(NOW(), INTERVAL 12 HOUR));

-- Ticket #20: Nightly backup report missing
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (20, @admin_demo, 'Sharing an update from our team. The latest infrastructure backup report has not reached the administrators mailbox.', FALSE, DATE_SUB(NOW(), INTERVAL 16 HOUR)),
    (20, @admin_demo, 'The backup platform completed its run, but no summary email was delivered.', TRUE, DATE_SUB(NOW(), INTERVAL 9 HOUR)),
    (20, @admin_demo, 'Awaiting technician assignment to inspect the notification job.', FALSE, DATE_SUB(NOW(), INTERVAL 3 HOUR));

-- Ticket #21: Database maintenance requires approval
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (21, @admin_demo, 'We are still seeing this behaviour. The planned database index maintenance cannot proceed until the change window is approved.', FALSE, DATE_SUB(NOW(), INTERVAL 128 HOUR)),
    (21, @daniel, 'The maintenance plan has been reviewed for application impact.', TRUE, DATE_SUB(NOW(), INTERVAL 71 HOUR)),
    (21, @daniel, 'The change request is awaiting approval from operations.', FALSE, DATE_SUB(NOW(), INTERVAL 24 HOUR));

-- Ticket #22: Teams guest invitation problem
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (22, @admin_demo, 'Please review the following problem. External guests were unable to join a project workspace using their invitation links.', FALSE, DATE_SUB(NOW(), INTERVAL 427 HOUR)),
    (22, @sofia, 'The guest access policy blocked invitations to approved partner domains.', TRUE, DATE_SUB(NOW(), INTERVAL 236 HOUR)),
    (22, @sofia, 'Updated the guest access policy and verified successful invitations.', FALSE, DATE_SUB(NOW(), INTERVAL 80 HOUR));

-- Ticket #23: Endpoint protection console alerts delayed
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (23, @admin_demo, 'This issue is affecting our usual workflow. Critical endpoint security alerts appear several hours late in the management console.', FALSE, DATE_SUB(NOW(), INTERVAL 85 HOUR)),
    (23, @mario, 'Alert ingestion is delayed although devices are reporting successfully.', TRUE, DATE_SUB(NOW(), INTERVAL 47 HOUR)),
    (23, @mario, 'The internal security team is investigating the delayed alert processing.', FALSE, DATE_SUB(NOW(), INTERVAL 16 HOUR));

-- Ticket #24: Office DNS lookup failures
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (24, @admin_demo, 'We would appreciate assistance with this request. Several workstations intermittently failed to resolve internal application hostnames.', FALSE, DATE_SUB(NOW(), INTERVAL 213 HOUR)),
    (24, @technician_demo, 'DNS forwarding rules were inconsistent across two resolvers.', TRUE, DATE_SUB(NOW(), INTERVAL 118 HOUR)),
    (24, @technician_demo, 'Corrected the DNS forwarders and confirmed stable name resolution.', FALSE, DATE_SUB(NOW(), INTERVAL 40 HOUR));

-- Ticket #25: IT inventory scanner not detecting laptops
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (25, @admin_demo, 'Following up on the reported incident. The asset inventory scanner is missing recently deployed company laptops.', FALSE, DATE_SUB(NOW(), INTERVAL 75 HOUR)),
    (25, @daniel, 'Devices are enrolled, but the discovery agent is not reporting hardware details.', TRUE, DATE_SUB(NOW(), INTERVAL 41 HOUR)),
    (25, @daniel, 'Reinstalling the inventory agent on a pilot group of devices.', FALSE, DATE_SUB(NOW(), INTERVAL 14 HOUR));

-- Ticket #26: Temporary permissions for retired portal
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (26, @admin_demo, 'Providing additional context about the problem. A temporary access request was raised for a portal that is being retired.', FALSE, DATE_SUB(NOW(), INTERVAL 320 HOUR)),
    (26, @admin_demo, 'The portal owner confirmed that the service was decommissioned.', TRUE, DATE_SUB(NOW(), INTERVAL 177 HOUR)),
    (26, @admin_demo, 'The ticket was closed because the portal is no longer available.', FALSE, DATE_SUB(NOW(), INTERVAL 60 HOUR));

-- Ticket #27: Unusual firewall events on support subnet
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (27, @technician_demo, 'Could someone investigate this issue? The service desk subnet is generating unexpected firewall deny events.', FALSE, DATE_SUB(NOW(), INTERVAL 53 HOUR)),
    (27, @mario, 'Packet captures show blocked outbound calls from a support tool.', TRUE, DATE_SUB(NOW(), INTERVAL 29 HOUR)),
    (27, @mario, 'Investigating the support tool network requirements before adding rules.', FALSE, DATE_SUB(NOW(), INTERVAL 10 HOUR));

-- Ticket #28: Shared printer driver deployment blocked
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (28, @technician_demo, 'Sharing an update from our team. The print server is rejecting the latest shared printer driver package.', FALSE, DATE_SUB(NOW(), INTERVAL 98 HOUR)),
    (28, @daniel, 'The driver package has been validated in a test environment.', TRUE, DATE_SUB(NOW(), INTERVAL 54 HOUR)),
    (28, @daniel, 'Awaiting the approved deployment window to update the print server.', FALSE, DATE_SUB(NOW(), INTERVAL 18 HOUR));

-- Ticket #29: Monitoring agent disconnected from cloud instance
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (29, @technician_demo, 'We are still seeing this behaviour. A cloud-hosted support instance stopped sending heartbeat metrics.', FALSE, DATE_SUB(NOW(), INTERVAL 284 HOUR)),
    (29, @sofia, 'The monitoring agent service failed after an operating system update.', TRUE, DATE_SUB(NOW(), INTERVAL 157 HOUR)),
    (29, @sofia, 'Restarted the agent with corrected settings; metrics are flowing again.', FALSE, DATE_SUB(NOW(), INTERVAL 54 HOUR));

-- Ticket #30: Update service desk remote support tool
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (30, @technician_demo, 'Please review the following problem. The remote assistance utility required an update to the approved version.', FALSE, DATE_SUB(NOW(), INTERVAL 373 HOUR)),
    (30, @technician_demo, 'The release was validated on one technician workstation.', TRUE, DATE_SUB(NOW(), INTERVAL 207 HOUR)),
    (30, @technician_demo, 'Rolled out the approved update to the support team.', FALSE, DATE_SUB(NOW(), INTERVAL 71 HOUR));

-- Ticket #31: Support phone cannot sync contacts
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (31, @technician_demo, 'This issue is affecting our usual workflow. The shared service desk phone stopped synchronizing the corporate address book.', FALSE, DATE_SUB(NOW(), INTERVAL 11 HOUR)),
    (31, @admin_demo, 'The phone reports that the directory sync token has expired.', TRUE, DATE_SUB(NOW(), INTERVAL 6 HOUR)),
    (31, @technician_demo, 'Awaiting assignment to investigate the device enrollment.', FALSE, DATE_SUB(NOW(), INTERVAL 2 HOUR));

-- Ticket #32: Restore test requires data owner confirmation
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (32, @technician_demo, 'We would appreciate assistance with this request. A restore test has produced recovered files that need business-owner validation.', FALSE, DATE_SUB(NOW(), INTERVAL 43 HOUR)),
    (32, @elena, 'The restore completed and file checksums match the backup copy.', TRUE, DATE_SUB(NOW(), INTERVAL 24 HOUR)),
    (32, @elena, 'Waiting for the data owner to confirm the restored documents.', FALSE, DATE_SUB(NOW(), INTERVAL 8 HOUR));

-- Ticket #33: Service desk reports timing out
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (33, @technician_demo, 'Following up on the reported incident. Ticket reporting queries are unusually slow during office hours.', FALSE, DATE_SUB(NOW(), INTERVAL 178 HOUR)),
    (33, @daniel, 'Identified a slow query on ticket history with a large result set.', TRUE, DATE_SUB(NOW(), INTERVAL 98 HOUR)),
    (33, @daniel, 'Evaluating a query optimisation and index usage.', FALSE, DATE_SUB(NOW(), INTERVAL 34 HOUR));

-- Ticket #34: Remote assistance session fails to connect
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (34, @technician_demo, 'Providing additional context about the problem. The remote support application cannot connect to certain employee computers.', FALSE, DATE_SUB(NOW(), INTERVAL 142 HOUR)),
    (34, @sofia, 'The connection gateway certificate had an outdated trust chain.', TRUE, DATE_SUB(NOW(), INTERVAL 79 HOUR)),
    (34, @sofia, 'Updated the certificate chain and verified remote connections.', FALSE, DATE_SUB(NOW(), INTERVAL 27 HOUR));

-- Ticket #35: Finance scanner adds blank pages
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (35, @user_demo, 'Could someone investigate this issue? The document scanner in Finance inserts blank pages into multi-page scans.', FALSE, DATE_SUB(NOW(), INTERVAL 18 HOUR)),
    (35, @admin_demo, 'The issue occurs on double-sided scans with the automatic document feeder.', TRUE, DATE_SUB(NOW(), INTERVAL 10 HOUR)),
    (35, @user_demo, 'Waiting for a technician to check the feeder settings.', FALSE, DATE_SUB(NOW(), INTERVAL 4 HOUR));

-- Ticket #36: Invoice emails not reaching suppliers
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (36, @user_demo, 'Sharing an update from our team. Several invoice emails sent from Finance are being rejected by external recipients.', FALSE, DATE_SUB(NOW(), INTERVAL 50 HOUR)),
    (36, @technician_demo, 'Mail logs indicate that the outgoing messages fail sender validation.', TRUE, DATE_SUB(NOW(), INTERVAL 27 HOUR)),
    (36, @technician_demo, 'Reviewing the sender policy and outbound email configuration.', FALSE, DATE_SUB(NOW(), INTERVAL 9 HOUR));

-- Ticket #37: Cannot open shared meeting notes
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (37, @user_demo, 'We are still seeing this behaviour. A shared project meeting notebook is inaccessible to some team members.', FALSE, DATE_SUB(NOW(), INTERVAL 107 HOUR)),
    (37, @sofia, 'The collaboration workspace permissions do not match the project group.', TRUE, DATE_SUB(NOW(), INTERVAL 59 HOUR)),
    (37, @sofia, 'Awaiting the workspace owner to approve access changes.', FALSE, DATE_SUB(NOW(), INTERVAL 20 HOUR));

-- Ticket #38: Finance laptop battery replacement
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (38, @user_demo, 'Please review the following problem. A finance laptop battery was draining within an hour of use.', FALSE, DATE_SUB(NOW(), INTERVAL 622 HOUR)),
    (38, @daniel, 'Diagnostics showed battery capacity below the replacement threshold.', TRUE, DATE_SUB(NOW(), INTERVAL 344 HOUR)),
    (38, @daniel, 'Replaced the battery and confirmed normal runtime.', FALSE, DATE_SUB(NOW(), INTERVAL 117 HOUR));

-- Ticket #39: MFA recovery after phone replacement
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (39, @user_demo, 'This issue is affecting our usual workflow. Finance lost access to a business app after the registered authenticator phone was replaced.', FALSE, DATE_SUB(NOW(), INTERVAL 249 HOUR)),
    (39, @elena, 'Verified the employees identity through the approved recovery process.', TRUE, DATE_SUB(NOW(), INTERVAL 138 HOUR)),
    (39, @elena, 'Re-enrolled the authenticator and restored account access.', FALSE, DATE_SUB(NOW(), INTERVAL 47 HOUR));

-- Ticket #40: Calendar missing from work phone
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (40, @user_demo, 'We would appreciate assistance with this request. The corporate calendar is not visible in the managed phone calendar application.', FALSE, DATE_SUB(NOW(), INTERVAL 57 HOUR)),
    (40, @technician_demo, 'The work profile is present but the calendar sync permission is disabled.', TRUE, DATE_SUB(NOW(), INTERVAL 32 HOUR)),
    (40, @technician_demo, 'Waiting for the user to confirm the requested sync permission.', FALSE, DATE_SUB(NOW(), INTERVAL 11 HOUR));

-- Ticket #41: New finance application access denied
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (41, @user_demo, 'Following up on the reported incident. The finance reporting application denies access despite the users approved role.', FALSE, DATE_SUB(NOW(), INTERVAL 85 HOUR)),
    (41, @mario, 'The directory group membership was updated but access has not propagated.', TRUE, DATE_SUB(NOW(), INTERVAL 47 HOUR)),
    (41, @mario, 'Investigating access token refresh and group synchronisation.', FALSE, DATE_SUB(NOW(), INTERVAL 16 HOUR));

-- Ticket #42: Request for unused desk phone extension
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (42, @user_demo, 'Providing additional context about the problem. A telephone extension was requested for a desk that will remain unoccupied.', FALSE, DATE_SUB(NOW(), INTERVAL 196 HOUR)),
    (42, @admin_demo, 'Facilities confirmed that the desk is no longer assigned.', TRUE, DATE_SUB(NOW(), INTERVAL 108 HOUR)),
    (42, @user_demo, 'The ticket was closed after the requester confirmed the extension was no longer needed.', FALSE, DATE_SUB(NOW(), INTERVAL 36 HOUR));

-- Ticket #43: CRM application freezes when saving deals
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (43, @pablo, 'Could someone investigate this issue? Sales staff see intermittent freezes when saving new opportunities in the CRM.', FALSE, DATE_SUB(NOW(), INTERVAL 62 HOUR)),
    (43, @daniel, 'The issue appears after the latest CRM desktop client update.', TRUE, DATE_SUB(NOW(), INTERVAL 34 HOUR)),
    (43, @daniel, 'Collecting logs from affected devices to isolate the failing component.', FALSE, DATE_SUB(NOW(), INTERVAL 12 HOUR));

-- Ticket #44: Sales softphone drops incoming calls
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (44, @pablo, 'Sharing an update from our team. The sales softphone was disconnecting incoming calls after a few seconds.', FALSE, DATE_SUB(NOW(), INTERVAL 231 HOUR)),
    (44, @mario, 'The voice client was using an outdated network transport setting.', TRUE, DATE_SUB(NOW(), INTERVAL 128 HOUR)),
    (44, @mario, 'Updated the softphone profile and confirmed stable incoming calls.', FALSE, DATE_SUB(NOW(), INTERVAL 44 HOUR));

-- Ticket #45: HR onboarding accounts missing permissions
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (45, @lucia, 'We are still seeing this behaviour. New starters can sign in but cannot access the employee onboarding portal.', FALSE, DATE_SUB(NOW(), INTERVAL 149 HOUR)),
    (45, @sofia, 'Account creation succeeded but the HR group approval is pending.', TRUE, DATE_SUB(NOW(), INTERVAL 83 HOUR)),
    (45, @sofia, 'Waiting for HR approval to assign the required access group.', FALSE, DATE_SUB(NOW(), INTERVAL 28 HOUR));

-- Ticket #46: Shared HR mailbox search not working
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (46, @lucia, 'Please review the following problem. Searches in the shared HR mailbox returned incomplete results.', FALSE, DATE_SUB(NOW(), INTERVAL 382 HOUR)),
    (46, @elena, 'The email profile index had become inconsistent.', TRUE, DATE_SUB(NOW(), INTERVAL 211 HOUR)),
    (46, @elena, 'Rebuilt the mail index and confirmed search works for old messages.', FALSE, DATE_SUB(NOW(), INTERVAL 72 HOUR));

-- Ticket #47: Marketing presentation permissions mismatch
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (47, @marta, 'This issue is affecting our usual workflow. The marketing team cannot edit shared presentation files in the campaign workspace.', FALSE, DATE_SUB(NOW(), INTERVAL 96 HOUR)),
    (47, @daniel, 'Editors have been assigned view-only access by the workspace group.', TRUE, DATE_SUB(NOW(), INTERVAL 53 HOUR)),
    (47, @daniel, 'Reviewing team ownership and inherited permissions.', FALSE, DATE_SUB(NOW(), INTERVAL 18 HOUR));

-- Ticket #48: Campaign analytics export fails
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (48, @marta, 'We would appreciate assistance with this request. The marketing analytics portal fails when exporting a weekly campaign report.', FALSE, DATE_SUB(NOW(), INTERVAL 267 HOUR)),
    (48, @sofia, 'An expired connector credential was blocking export jobs.', TRUE, DATE_SUB(NOW(), INTERVAL 147 HOUR)),
    (48, @sofia, 'Renewed the connector credential and completed a successful export.', FALSE, DATE_SUB(NOW(), INTERVAL 50 HOUR));

-- Ticket #49: Confidential document access alert
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (49, @javier, 'Following up on the reported incident. The Legal team received an alert about attempted access to a restricted document.', FALSE, DATE_SUB(NOW(), INTERVAL 32 HOUR)),
    (49, @elena, 'Audit records show repeated denied requests from an unmanaged device.', TRUE, DATE_SUB(NOW(), INTERVAL 18 HOUR)),
    (49, @elena, 'Reviewing device activity and confirming whether credentials were compromised.', FALSE, DATE_SUB(NOW(), INTERVAL 6 HOUR));

-- Ticket #50: Legal department printer produces faded text
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (50, @javier, 'Providing additional context about the problem. Printed contracts have faint text even after changing the toner cartridge.', FALSE, DATE_SUB(NOW(), INTERVAL 12 HOUR)),
    (50, @admin_demo, 'The print quality issue affects documents from multiple applications.', TRUE, DATE_SUB(NOW(), INTERVAL 7 HOUR)),
    (50, @javier, 'Waiting for technician assignment to inspect the printer.', FALSE, DATE_SUB(NOW(), INTERVAL 2 HOUR));

-- Ticket #51: Warehouse Wi-Fi access points rebooting
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (51, @sara, 'Could someone investigate this issue? Operations reports repeated Wi-Fi interruptions near the warehouse dispatch area.', FALSE, DATE_SUB(NOW(), INTERVAL 133 HOUR)),
    (51, @mario, 'Access points reboot unexpectedly during peak device usage.', TRUE, DATE_SUB(NOW(), INTERVAL 74 HOUR)),
    (51, @mario, 'The network team is reviewing diagnostics and firmware logs.', FALSE, DATE_SUB(NOW(), INTERVAL 25 HOUR));

-- Ticket #52: Operations report accidentally deleted
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (52, @sara, 'Sharing an update from our team. An operations performance report was removed from a shared folder.', FALSE, DATE_SUB(NOW(), INTERVAL 320 HOUR)),
    (52, @daniel, 'Located the latest protected version in the backup repository.', TRUE, DATE_SUB(NOW(), INTERVAL 177 HOUR)),
    (52, @daniel, 'Restored the report and validated its contents with the requester.', FALSE, DATE_SUB(NOW(), INTERVAL 60 HOUR));

-- Ticket #53: Customer support VPN drops active calls
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (53, @alberto, 'We are still seeing this behaviour. The VPN connection disconnects while customer support staff use the calling application.', FALSE, DATE_SUB(NOW(), INTERVAL 39 HOUR)),
    (53, @technician_demo, 'The VPN client changes network routes during long sessions.', TRUE, DATE_SUB(NOW(), INTERVAL 21 HOUR)),
    (53, @technician_demo, 'Comparing client logs and gateway session timeouts.', FALSE, DATE_SUB(NOW(), INTERVAL 7 HOUR));

-- Ticket #54: Call queue greeting not updating
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (54, @alberto, 'Please review the following problem. Customer support updated the greeting, but callers still hear the previous message.', FALSE, DATE_SUB(NOW(), INTERVAL 160 HOUR)),
    (54, @sofia, 'The new audio file was uploaded but the telephony queue has not published it.', TRUE, DATE_SUB(NOW(), INTERVAL 89 HOUR)),
    (54, @sofia, 'Waiting for confirmation of the approved publish window.', FALSE, DATE_SUB(NOW(), INTERVAL 31 HOUR));

-- Ticket #55: Procurement vendor portal access
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (55, @clara, 'This issue is affecting our usual workflow. Procurement was unable to access the supplier onboarding portal.', FALSE, DATE_SUB(NOW(), INTERVAL 480 HOUR)),
    (55, @mario, 'The employee account lacked the required vendor portal group.', TRUE, DATE_SUB(NOW(), INTERVAL 265 HOUR)),
    (55, @mario, 'Assigned the approved group and confirmed successful sign-in.', FALSE, DATE_SUB(NOW(), INTERVAL 90 HOUR));

-- Ticket #56: Purchase order barcode reader not detected
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (56, @clara, 'We would appreciate assistance with this request. The USB barcode reader in Procurement was not recognised after a restart.', FALSE, DATE_SUB(NOW(), INTERVAL 231 HOUR)),
    (56, @daniel, 'Device manager showed that the reader driver was missing.', TRUE, DATE_SUB(NOW(), INTERVAL 128 HOUR)),
    (56, @daniel, 'Installed the supported driver and verified barcode scanning.', FALSE, DATE_SUB(NOW(), INTERVAL 44 HOUR));

-- Ticket #57: Development database access request
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (57, @david, 'Following up on the reported incident. The product team requires read-only access to a non-production database.', FALSE, DATE_SUB(NOW(), INTERVAL 100 HOUR)),
    (57, @sofia, 'The requested access scope has been reviewed with the database owner.', TRUE, DATE_SUB(NOW(), INTERVAL 55 HOUR)),
    (57, @sofia, 'Waiting for the requester to confirm the list of required tables.', FALSE, DATE_SUB(NOW(), INTERVAL 18 HOUR));

-- Ticket #58: Staging deployment pipeline failing
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (58, @david, 'Providing additional context about the problem. A product release staging job repeatedly fails to deploy a build artifact.', FALSE, DATE_SUB(NOW(), INTERVAL 44 HOUR)),
    (58, @elena, 'Pipeline logs indicate a permission error in the staging registry.', TRUE, DATE_SUB(NOW(), INTERVAL 25 HOUR)),
    (58, @elena, 'Investigating the build identity and registry permissions.', FALSE, DATE_SUB(NOW(), INTERVAL 9 HOUR));

-- Ticket #59: Office network switch port errors
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (59, @daniel, 'Could someone investigate this issue? Repeated port errors caused sporadic connectivity for two IT workstations.', FALSE, DATE_SUB(NOW(), INTERVAL 276 HOUR)),
    (59, @mario, 'The affected network switch had mismatched interface settings.', TRUE, DATE_SUB(NOW(), INTERVAL 152 HOUR)),
    (59, @mario, 'Corrected the settings and monitored the ports without new errors.', FALSE, DATE_SUB(NOW(), INTERVAL 52 HOUR));

-- Ticket #60: Remove deprecated antivirus management rule
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (60, @elena, 'Sharing an update from our team. An unused antivirus policy remained assigned to a retired endpoint group.', FALSE, DATE_SUB(NOW(), INTERVAL 516 HOUR)),
    (60, @technician_demo, 'Verified that no active devices depend on the policy.', TRUE, DATE_SUB(NOW(), INTERVAL 285 HOUR)),
    (60, @technician_demo, 'Removed the obsolete rule after change approval.', FALSE, DATE_SUB(NOW(), INTERVAL 98 HOUR));

-- ------------------------------------------------------------
-- 5. TICKET HISTORY (creation, assignment, status changes...)
-- ------------------------------------------------------------
-- Ticket #1: Critical access to administration portal
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (1, @admin_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 24 HOUR));

-- Ticket #2: Administrative security permissions issue
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (2, @admin_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 72 HOUR)),
    (2, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'technician_demo', DATE_SUB(NOW(), INTERVAL 58 HOUR)),
    (2, @technician_demo, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 22 HOUR));

-- Ticket #3: Administration software update pending
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (3, @admin_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 96 HOUR)),
    (3, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.sofia', DATE_SUB(NOW(), INTERVAL 78 HOUR)),
    (3, @sofia, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 51 HOUR)),
    (3, @sofia, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'BLOCKED', DATE_SUB(NOW(), INTERVAL 6 HOUR));

-- Ticket #4: Administrative VPN problem resolved
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (4, @admin_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 168 HOUR)),
    (4, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.sofia', DATE_SUB(NOW(), INTERVAL 144 HOUR)),
    (4, @sofia, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 108 HOUR)),
    (4, @sofia, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 48 HOUR));

-- Ticket #5: Administrative email configuration
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (5, @admin_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 240 HOUR)),
    (5, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'technician_demo', DATE_SUB(NOW(), INTERVAL 216 HOUR)),
    (5, @technician_demo, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 180 HOUR)),
    (5, @technician_demo, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 146 HOUR)),
    (5, @technician_demo, 'STATUS_CHANGED', 'status', 'RESOLVED', 'CLOSED', DATE_SUB(NOW(), INTERVAL 120 HOUR));

-- Ticket #6: Security console unavailable
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (6, @technician_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 24 HOUR));

-- Ticket #7: Technician network connectivity problem
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (7, @technician_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 72 HOUR)),
    (7, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'technician_demo', DATE_SUB(NOW(), INTERVAL 58 HOUR)),
    (7, @technician_demo, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 22 HOUR));

-- Ticket #8: Support software license pending
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (8, @technician_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 120 HOUR)),
    (8, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.sofia', DATE_SUB(NOW(), INTERVAL 98 HOUR)),
    (8, @sofia, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 64 HOUR)),
    (8, @sofia, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'BLOCKED', DATE_SUB(NOW(), INTERVAL 8 HOUR));

-- Ticket #9: Technician email synchronization resolved
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (9, @technician_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 168 HOUR)),
    (9, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'technician_demo', DATE_SUB(NOW(), INTERVAL 144 HOUR)),
    (9, @technician_demo, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 108 HOUR)),
    (9, @technician_demo, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 48 HOUR));

-- Ticket #10: Technician monitor configuration
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (10, @technician_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 240 HOUR)),
    (10, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.mario', DATE_SUB(NOW(), INTERVAL 211 HOUR)),
    (10, @mario, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 168 HOUR)),
    (10, @mario, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 128 HOUR)),
    (10, @mario, 'STATUS_CHANGED', 'status', 'RESOLVED', 'CLOSED', DATE_SUB(NOW(), INTERVAL 96 HOUR));

-- Ticket #11: Suspicious login detected
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (11, @user_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 24 HOUR)),
    (11, @admin_demo, 'PRIORITY_CHANGED', 'priority', 'HIGH', 'CRITICAL', DATE_SUB(NOW(), INTERVAL 21 HOUR));

-- Ticket #12: Corporate VPN connection failure
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (12, @user_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 72 HOUR)),
    (12, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'technician_demo', DATE_SUB(NOW(), INTERVAL 58 HOUR)),
    (12, @user_demo, 'TITLE_CHANGED', 'title', 'VPN problem', 'Corporate VPN connection failure', DATE_SUB(NOW(), INTERVAL 52 HOUR)),
    (12, @user_demo, 'DESCRIPTION_CHANGED', 'description', 'The VPN is not working.', 'The user cannot connect to the corporate VPN while working remotely.', DATE_SUB(NOW(), INTERVAL 45 HOUR)),
    (12, @admin_demo, 'PRIORITY_CHANGED', 'priority', 'MEDIUM', 'HIGH', DATE_SUB(NOW(), INTERVAL 39 HOUR)),
    (12, @technician_demo, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 23 HOUR));

-- Ticket #13: Excel report application error
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (13, @user_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 96 HOUR)),
    (13, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'technician_demo', DATE_SUB(NOW(), INTERVAL 82 HOUR)),
    (13, @user_demo, 'DESCRIPTION_CHANGED', 'description', 'Excel does not work correctly.', 'Excel closes unexpectedly when opening a specific report.', DATE_SUB(NOW(), INTERVAL 74 HOUR)),
    (13, @technician_demo, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 60 HOUR)),
    (13, @technician_demo, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'BLOCKED', DATE_SUB(NOW(), INTERVAL 24 HOUR));

-- Ticket #14: Password access problem resolved
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (14, @user_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 144 HOUR)),
    (14, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.sofia', DATE_SUB(NOW(), INTERVAL 125 HOUR)),
    (14, @admin_demo, 'CATEGORY_CHANGED', 'category', 'Software', 'Access', DATE_SUB(NOW(), INTERVAL 115 HOUR)),
    (14, @sofia, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 96 HOUR)),
    (14, @sofia, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 48 HOUR));

-- Ticket #15: Keyboard replacement completed
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (15, @user_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 216 HOUR)),
    (15, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.mario', DATE_SUB(NOW(), INTERVAL 192 HOUR)),
    (15, @admin_demo, 'REASSIGNED', 'assignedTo', 'tech.mario', 'technician_demo', DATE_SUB(NOW(), INTERVAL 174 HOUR)),
    (15, @technician_demo, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 156 HOUR)),
    (15, @technician_demo, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 122 HOUR)),
    (15, @technician_demo, 'STATUS_CHANGED', 'status', 'RESOLVED', 'CLOSED', DATE_SUB(NOW(), INTERVAL 96 HOUR));

-- Ticket #16: Sales laptop running slowly
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (16, @pablo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 48 HOUR));

-- Ticket #17: Sales MFA prompts repeatedly
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (17, @pablo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 72 HOUR)),
    (17, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.mario', DATE_SUB(NOW(), INTERVAL 59 HOUR)),
    (17, @mario, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 24 HOUR));

-- Ticket #18: Human Resources mailbox restored
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (18, @lucia, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 96 HOUR)),
    (18, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.sofia', DATE_SUB(NOW(), INTERVAL 86 HOUR)),
    (18, @sofia, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 72 HOUR)),
    (18, @sofia, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 48 HOUR));

-- ------------------------------------------------------------
-- ADDITIONAL DEMO HISTORY (TICKETS 19..60)
-- ------------------------------------------------------------
-- Ticket #19: SSO login failure for cloud administration
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (19, @admin_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 72 HOUR)),
    (19, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.elena', DATE_SUB(NOW(), INTERVAL 54 HOUR)),
    (19, @admin_demo, 'PRIORITY_CHANGED', 'priority', 'MEDIUM', 'CRITICAL', DATE_SUB(NOW(), INTERVAL 44 HOUR)),
    (19, @elena, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 44 HOUR));

-- Ticket #20: Nightly backup report missing
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (20, @admin_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 18 HOUR));

-- Ticket #21: Database maintenance requires approval
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (21, @admin_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 144 HOUR)),
    (21, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.daniel', DATE_SUB(NOW(), INTERVAL 108 HOUR)),
    (21, @daniel, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 88 HOUR)),
    (21, @daniel, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'BLOCKED', DATE_SUB(NOW(), INTERVAL 39 HOUR));

-- Ticket #22: Teams guest invitation problem
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (22, @admin_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 480 HOUR)),
    (22, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.sofia', DATE_SUB(NOW(), INTERVAL 360 HOUR)),
    (22, @sofia, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 294 HOUR)),
    (22, @sofia, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 129 HOUR)),
    (22, @sofia, 'STATUS_CHANGED', 'status', 'RESOLVED', 'CLOSED', DATE_SUB(NOW(), INTERVAL 80 HOUR));

-- Ticket #23: Endpoint protection console alerts delayed
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (23, @admin_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 96 HOUR)),
    (23, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.mario', DATE_SUB(NOW(), INTERVAL 72 HOUR)),
    (23, @mario, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 59 HOUR)),
    (23, @mario, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'BLOCKED', DATE_SUB(NOW(), INTERVAL 26 HOUR));

-- Ticket #24: Office DNS lookup failures
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (24, @admin_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 240 HOUR)),
    (24, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'technician_demo', DATE_SUB(NOW(), INTERVAL 180 HOUR)),
    (24, @technician_demo, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 147 HOUR)),
    (24, @technician_demo, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 65 HOUR));

-- Ticket #25: IT inventory scanner not detecting laptops
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (25, @admin_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 84 HOUR)),
    (25, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.daniel', DATE_SUB(NOW(), INTERVAL 63 HOUR)),
    (25, @daniel, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 51 HOUR));

-- Ticket #26: Temporary permissions for retired portal
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (26, @admin_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 360 HOUR)),
    (26, @admin_demo, 'STATUS_CHANGED', 'status', 'OPEN', 'CLOSED', DATE_SUB(NOW(), INTERVAL 97 HOUR));

-- Ticket #27: Unusual firewall events on support subnet
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (27, @technician_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 60 HOUR)),
    (27, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.mario', DATE_SUB(NOW(), INTERVAL 45 HOUR)),
    (27, @mario, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 36 HOUR));

-- Ticket #28: Shared printer driver deployment blocked
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (28, @technician_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 110 HOUR)),
    (28, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.daniel', DATE_SUB(NOW(), INTERVAL 82 HOUR)),
    (28, @admin_demo, 'PRIORITY_CHANGED', 'priority', 'LOW', 'MEDIUM', DATE_SUB(NOW(), INTERVAL 67 HOUR)),
    (28, @daniel, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 67 HOUR)),
    (28, @daniel, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'BLOCKED', DATE_SUB(NOW(), INTERVAL 29 HOUR));

-- Ticket #29: Monitoring agent disconnected from cloud instance
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (29, @technician_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 320 HOUR)),
    (29, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.sofia', DATE_SUB(NOW(), INTERVAL 240 HOUR)),
    (29, @sofia, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 196 HOUR)),
    (29, @sofia, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 86 HOUR));

-- Ticket #30: Update service desk remote support tool
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (30, @technician_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 420 HOUR)),
    (30, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'technician_demo', DATE_SUB(NOW(), INTERVAL 315 HOUR)),
    (30, @technician_demo, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 257 HOUR)),
    (30, @technician_demo, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 113 HOUR)),
    (30, @technician_demo, 'STATUS_CHANGED', 'status', 'RESOLVED', 'CLOSED', DATE_SUB(NOW(), INTERVAL 71 HOUR));

-- Ticket #31: Support phone cannot sync contacts
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (31, @technician_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 12 HOUR));

-- Ticket #32: Restore test requires data owner confirmation
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (32, @technician_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 48 HOUR)),
    (32, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.elena', DATE_SUB(NOW(), INTERVAL 36 HOUR)),
    (32, @elena, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 30 HOUR)),
    (32, @elena, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'BLOCKED', DATE_SUB(NOW(), INTERVAL 13 HOUR));

-- Ticket #33: Service desk reports timing out
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (33, @technician_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 200 HOUR)),
    (33, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.daniel', DATE_SUB(NOW(), INTERVAL 150 HOUR)),
    (33, @daniel, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 122 HOUR));

-- Ticket #34: Remote assistance session fails to connect
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (34, @technician_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 160 HOUR)),
    (34, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.sofia', DATE_SUB(NOW(), INTERVAL 120 HOUR)),
    (34, @sofia, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 98 HOUR)),
    (34, @sofia, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 43 HOUR));

-- Ticket #35: Finance scanner adds blank pages
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (35, @user_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 20 HOUR));

-- Ticket #36: Invoice emails not reaching suppliers
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (36, @user_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 56 HOUR)),
    (36, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'technician_demo', DATE_SUB(NOW(), INTERVAL 42 HOUR)),
    (36, @technician_demo, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 34 HOUR));

-- Ticket #37: Cannot open shared meeting notes
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (37, @user_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 120 HOUR)),
    (37, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.sofia', DATE_SUB(NOW(), INTERVAL 90 HOUR)),
    (37, @sofia, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 73 HOUR)),
    (37, @sofia, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'BLOCKED', DATE_SUB(NOW(), INTERVAL 32 HOUR));

-- Ticket #38: Finance laptop battery replacement
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (38, @user_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 700 HOUR)),
    (38, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.daniel', DATE_SUB(NOW(), INTERVAL 525 HOUR)),
    (38, @daniel, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 428 HOUR)),
    (38, @daniel, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 188 HOUR)),
    (38, @daniel, 'STATUS_CHANGED', 'status', 'RESOLVED', 'CLOSED', DATE_SUB(NOW(), INTERVAL 117 HOUR));

-- Ticket #39: MFA recovery after phone replacement
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (39, @user_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 280 HOUR)),
    (39, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.elena', DATE_SUB(NOW(), INTERVAL 210 HOUR)),
    (39, @elena, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 171 HOUR)),
    (39, @elena, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 75 HOUR));

-- Ticket #40: Calendar missing from work phone
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (40, @user_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 64 HOUR)),
    (40, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'technician_demo', DATE_SUB(NOW(), INTERVAL 48 HOUR)),
    (40, @technician_demo, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 39 HOUR)),
    (40, @technician_demo, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'BLOCKED', DATE_SUB(NOW(), INTERVAL 17 HOUR));

-- Ticket #41: New finance application access denied
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (41, @user_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 96 HOUR)),
    (41, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.mario', DATE_SUB(NOW(), INTERVAL 72 HOUR)),
    (41, @mario, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 59 HOUR));

-- Ticket #42: Request for unused desk phone extension
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (42, @user_demo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 220 HOUR)),
    (42, @user_demo, 'STATUS_CHANGED', 'status', 'OPEN', 'CLOSED', DATE_SUB(NOW(), INTERVAL 59 HOUR));

-- Ticket #43: CRM application freezes when saving deals
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (43, @pablo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 70 HOUR)),
    (43, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.daniel', DATE_SUB(NOW(), INTERVAL 52 HOUR)),
    (43, @admin_demo, 'PRIORITY_CHANGED', 'priority', 'MEDIUM', 'HIGH', DATE_SUB(NOW(), INTERVAL 43 HOUR)),
    (43, @daniel, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 43 HOUR));

-- Ticket #44: Sales softphone drops incoming calls
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (44, @pablo, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 260 HOUR)),
    (44, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.mario', DATE_SUB(NOW(), INTERVAL 195 HOUR)),
    (44, @mario, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 159 HOUR)),
    (44, @mario, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 70 HOUR));

-- Ticket #45: HR onboarding accounts missing permissions
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (45, @lucia, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 168 HOUR)),
    (45, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.sofia', DATE_SUB(NOW(), INTERVAL 126 HOUR)),
    (45, @sofia, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 103 HOUR)),
    (45, @sofia, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'BLOCKED', DATE_SUB(NOW(), INTERVAL 46 HOUR));

-- Ticket #46: Shared HR mailbox search not working
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (46, @lucia, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 430 HOUR)),
    (46, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.elena', DATE_SUB(NOW(), INTERVAL 323 HOUR)),
    (46, @elena, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 263 HOUR)),
    (46, @elena, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 116 HOUR)),
    (46, @elena, 'STATUS_CHANGED', 'status', 'RESOLVED', 'CLOSED', DATE_SUB(NOW(), INTERVAL 72 HOUR));

-- Ticket #47: Marketing presentation permissions mismatch
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (47, @marta, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 108 HOUR)),
    (47, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.daniel', DATE_SUB(NOW(), INTERVAL 81 HOUR)),
    (47, @daniel, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 66 HOUR));

-- Ticket #48: Campaign analytics export fails
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (48, @marta, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 300 HOUR)),
    (48, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.sofia', DATE_SUB(NOW(), INTERVAL 225 HOUR)),
    (48, @sofia, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 183 HOUR)),
    (48, @sofia, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 80 HOUR));

-- Ticket #49: Confidential document access alert
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (49, @javier, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 36 HOUR)),
    (49, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.elena', DATE_SUB(NOW(), INTERVAL 27 HOUR)),
    (49, @admin_demo, 'PRIORITY_CHANGED', 'priority', 'MEDIUM', 'CRITICAL', DATE_SUB(NOW(), INTERVAL 22 HOUR)),
    (49, @elena, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 22 HOUR));

-- Ticket #50: Legal department printer produces faded text
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (50, @javier, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 14 HOUR));

-- Ticket #51: Warehouse Wi-Fi access points rebooting
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (51, @sara, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 150 HOUR)),
    (51, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.mario', DATE_SUB(NOW(), INTERVAL 112 HOUR)),
    (51, @mario, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 92 HOUR)),
    (51, @mario, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'BLOCKED', DATE_SUB(NOW(), INTERVAL 40 HOUR));

-- Ticket #52: Operations report accidentally deleted
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (52, @sara, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 360 HOUR)),
    (52, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.daniel', DATE_SUB(NOW(), INTERVAL 270 HOUR)),
    (52, @daniel, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 220 HOUR)),
    (52, @daniel, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 97 HOUR));

-- Ticket #53: Customer support VPN drops active calls
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (53, @alberto, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 44 HOUR)),
    (53, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'technician_demo', DATE_SUB(NOW(), INTERVAL 33 HOUR)),
    (53, @technician_demo, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 27 HOUR));

-- Ticket #54: Call queue greeting not updating
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (54, @alberto, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 180 HOUR)),
    (54, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.sofia', DATE_SUB(NOW(), INTERVAL 135 HOUR)),
    (54, @sofia, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 110 HOUR)),
    (54, @sofia, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'BLOCKED', DATE_SUB(NOW(), INTERVAL 49 HOUR));

-- Ticket #55: Procurement vendor portal access
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (55, @clara, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 540 HOUR)),
    (55, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.mario', DATE_SUB(NOW(), INTERVAL 405 HOUR)),
    (55, @mario, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 330 HOUR)),
    (55, @mario, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 145 HOUR)),
    (55, @mario, 'STATUS_CHANGED', 'status', 'RESOLVED', 'CLOSED', DATE_SUB(NOW(), INTERVAL 90 HOUR));

-- Ticket #56: Purchase order barcode reader not detected
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (56, @clara, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 260 HOUR)),
    (56, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.daniel', DATE_SUB(NOW(), INTERVAL 195 HOUR)),
    (56, @daniel, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 159 HOUR)),
    (56, @daniel, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 70 HOUR));

-- Ticket #57: Development database access request
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (57, @david, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 112 HOUR)),
    (57, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.sofia', DATE_SUB(NOW(), INTERVAL 84 HOUR)),
    (57, @sofia, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 68 HOUR)),
    (57, @sofia, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'BLOCKED', DATE_SUB(NOW(), INTERVAL 30 HOUR));

-- Ticket #58: Staging deployment pipeline failing
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (58, @david, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 50 HOUR)),
    (58, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.elena', DATE_SUB(NOW(), INTERVAL 38 HOUR)),
    (58, @elena, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 31 HOUR));

-- Ticket #59: Office network switch port errors
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (59, @daniel, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 310 HOUR)),
    (59, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'tech.mario', DATE_SUB(NOW(), INTERVAL 233 HOUR)),
    (59, @admin_demo, 'PRIORITY_CHANGED', 'priority', 'LOW', 'MEDIUM', DATE_SUB(NOW(), INTERVAL 189 HOUR)),
    (59, @mario, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 189 HOUR)),
    (59, @mario, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 83 HOUR));

-- Ticket #60: Remove deprecated antivirus management rule
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (60, @elena, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 580 HOUR)),
    (60, @admin_demo, 'ASSIGNED', 'assignedTo', NULL, 'technician_demo', DATE_SUB(NOW(), INTERVAL 435 HOUR)),
    (60, @technician_demo, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 355 HOUR)),
    (60, @technician_demo, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 157 HOUR)),
    (60, @technician_demo, 'STATUS_CHANGED', 'status', 'RESOLVED', 'CLOSED', DATE_SUB(NOW(), INTERVAL 98 HOUR));

COMMIT;

-- ------------------------------------------------------------
-- 6. QUICK VERIFICATION (read-only)
-- ------------------------------------------------------------
SELECT u.username, r.name AS role, u.enabled
FROM users AS u JOIN roles AS r ON r.id_role = u.id_role
WHERE u.username IN ('admin_demo', 'technician_demo', 'user_demo') ORDER BY u.username;
SELECT (SELECT COUNT(*) FROM users) AS total_users,
       (SELECT COUNT(*) FROM tickets) AS total_tickets,
       (SELECT COUNT(*) FROM ticket_comments) AS total_comments,
       (SELECT COUNT(*) FROM ticket_history) AS total_history_events;

-- Breakdown to verify demo coverage and assignments.
SELECT s.name AS status_name, COUNT(*) AS total_tickets
FROM tickets t JOIN statuses s ON s.id_status = t.id_status
GROUP BY s.name ORDER BY total_tickets DESC, s.name;

SELECT u.username AS technician_username, COUNT(*) AS assigned_tickets
FROM tickets t JOIN users u ON u.id_user = t.id_assigned_to
GROUP BY u.username ORDER BY assigned_tickets DESC, u.username;