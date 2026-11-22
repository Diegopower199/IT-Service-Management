-- ============================================================
-- HELP DESK / IT SERVICE MANAGEMENT - DEMO DATA
-- 03 - DEMO DATA (MySQL 8.0+)
-- ============================================================
-- Run AFTER 02_seed_reference_data.sql on a NEW/EMPTY schema.
-- Contains ONLY demo accounts, tickets, comments and history.
-- Does not recreate reference catalogs.
-- NOT idempotent: execute only once; NEVER against production.
-- Each account has a freshly generated BCrypt hash.
-- Local development/demo only; do not expose demo accounts in public deployments.
-- Ticket IDs 1..18 are explicit, referenced by the fixtures.
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
SET @priority_low = (SELECT id_priority FROM priorities WHERE name = 'LOW');
SET @priority_medium = (SELECT id_priority FROM priorities WHERE name = 'MEDIUM');
SET @priority_high = (SELECT id_priority FROM priorities WHERE name = 'HIGH');
SET @priority_critical = (SELECT id_priority FROM priorities WHERE name = 'CRITICAL');
SET @status_open = (SELECT id_status FROM statuses WHERE name = 'OPEN');
SET @status_in_progress = (SELECT id_status FROM statuses WHERE name = 'IN_PROGRESS');
SET @status_waiting = (SELECT id_status FROM statuses WHERE name = 'WAITING');
SET @status_resolved = (SELECT id_status FROM statuses WHERE name = 'RESOLVED');
SET @status_closed = (SELECT id_status FROM statuses WHERE name = 'CLOSED');

-- ------------------------------------------------------------
-- 2. USERS (individual BCrypt password hashes)
-- ------------------------------------------------------------
-- Mandatory test accounts: admin / technician / user.
-- Existing extra accounts: tech.sofia / tech.mario / user.pablo / user.lucia.
-- Additional demo accounts: 2 technicians and 6 regular users.
-- Passwords for additional accounts are stored in a private local credentials file.
INSERT INTO users
    (username, email, password, first_name, last_name, enabled, id_role, id_department)
VALUES
    ('admin', 'admin@company.test', '$2a$10$jqObpOlQ4kgKXFvp5Y5EKuIIX2M5B1puAJZ7dcxJrnQza0r0D.X3O', 'Demo', 'Administrator', TRUE, @role_admin, @department_it),
    ('technician', 'technician@company.test', '$2a$10$jqObpOlQ4kgKXFvp5Y5EKuIIX2M5B1puAJZ7dcxJrnQza0r0D.X3O', 'Demo', 'Technician', TRUE, @role_technician, @department_it),
    ('user', 'user@company.test', '$2a$10$jqObpOlQ4kgKXFvp5Y5EKuIIX2M5B1puAJZ7dcxJrnQza0r0D.X3O', 'Demo', 'User', TRUE, @role_user, @department_finance),
    ('tech.sofia', 'tech.sofia@company.test', '$2a$10$nvxSu3VjA6pzxeV.6HBFsu49Q29IlGB/SUM0QAl18wpglaA4tusp.', 'Sofia', 'Lopez', TRUE, @role_technician, @department_it),
    ('tech.mario', 'tech.mario@company.test', '$2a$10$sa0YY0G9UEle2AmbZHg9hOznEBpUXPx0tuCQHydArF4lda5H44Prm', 'Mario', 'Ruiz', TRUE, @role_technician, @department_security),
    ('user.pablo', 'user.pablo@company.test', '$2a$10$97U4E9imXzMIZNzRpUI.z.4xEb2Dz72fg1w4Nj.dwQT86Zf2h.mpO', 'Pablo', 'Santos', TRUE, @role_user, @department_sales),
    ('user.lucia', 'user.lucia@company.test', '$2a$10$OYU65ld3QYytund17M21B.aV00xtGtfhXdzTz4HRB/7MqlTtpgSyG', 'Lucia', 'Martin', TRUE, @role_user, @department_human_resources),
    ('tech.daniel', 'tech.daniel@company.test', '$2a$10$SIqrcNJygXJ7jR8CPqBSf.hZhTH6sx9CrlqZgy/B9jmWs9yNisa66', 'Daniel', 'Moreno', TRUE, @role_technician, @department_it),
    ('tech.elena', 'tech.elena@company.test', '$2a$10$won0P6HRK8v0no8NlONLHOi75YYSrWir/7lri6ggzRXu/zCbNwPES', 'Elena', 'Vega', TRUE, @role_technician, @department_security),
    ('user.marta', 'user.marta@company.test', '$2a$10$1Htl1uE86.ehRTdnn0Ss1eXdCxmnUMJ/igcmSB0J36x.aIUabkcqe', 'Marta', 'Navarro', TRUE, @role_user, @department_marketing),
    ('user.javier', 'user.javier@company.test', '$2a$10$VEPC7qo1WrdWIKYXsToEAOUh6XuNPeLnmz8CcIuONDA.jHiH.2MUS', 'Javier', 'Torres', TRUE, @role_user, @department_legal),
    ('user.sara', 'user.sara@company.test', '$2a$10$dL4kk4x5ry2wcdbFIa9FN.TBUiYAWIAWP/Gs32Nz.LaLo2TgXJmRm', 'Sara', 'Romero', TRUE, @role_user, @department_operations),
    ('user.alberto', 'user.alberto@company.test', '$2a$10$mkXZm.s67VXDvd03hqVPBeN1BQCuc82rfY5lOkZtmXdlAiZ.g37ie', 'Alberto', 'Molina', TRUE, @role_user, @department_customer_support),
    ('user.clara', 'user.clara@company.test', '$2a$10$8tw.fWTyq1LcX6RB1moUbeXwN2U2N.21Z6XupAPwinkS3WZ73C8YO', 'Clara', 'Fernandez', TRUE, @role_user, @department_procurement),
    ('user.david', 'user.david@company.test', '$2a$10$a2dX0Hahd2xFXIUV8Fssn.gbeALPHeQtWUz0v4.EiD9qURcl8HFHy', 'David', 'Ortega', TRUE, @role_user, @department_product_development);

SET @admin = (SELECT id_user FROM users WHERE username = 'admin');
SET @technician = (SELECT id_user FROM users WHERE username = 'technician');
SET @user = (SELECT id_user FROM users WHERE username = 'user');
SET @sofia = (SELECT id_user FROM users WHERE username = 'tech.sofia');
SET @mario = (SELECT id_user FROM users WHERE username = 'tech.mario');
SET @pablo = (SELECT id_user FROM users WHERE username = 'user.pablo');
SET @lucia = (SELECT id_user FROM users WHERE username = 'user.lucia');

-- ------------------------------------------------------------
-- 3. TICKETS
-- ------------------------------------------------------------
-- Each core user has tickets in all five statuses; additional users
-- provide extra assignment and permission-testing scenarios.
-- A NULL assigned user represents an unassigned ticket.
INSERT INTO tickets
    (id_ticket, title, description, created_at, last_updated,
     id_created_by, id_requested_for, id_assigned_to, id_category, id_priority, id_status)
VALUES
    (1, 'Critical access to administration portal', 'The administrator cannot access the corporate administration portal.', DATE_SUB(NOW(), INTERVAL 24 HOUR), DATE_SUB(NOW(), INTERVAL 18 HOUR), @admin, @admin, NULL, @category_access, @priority_critical, @status_open),
    (2, 'Administrative security permissions issue', 'Some administrative permissions are not working correctly.', DATE_SUB(NOW(), INTERVAL 72 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR), @admin, @admin, @technician, @category_security, @priority_high, @status_in_progress),
    (3, 'Administration software update pending', 'A required administration software update is waiting for approval.', DATE_SUB(NOW(), INTERVAL 96 HOUR), DATE_SUB(NOW(), INTERVAL 6 HOUR), @admin, @admin, @sofia, @category_software, @priority_medium, @status_waiting),
    (4, 'Administrative VPN problem resolved', 'The VPN connection used by the administrator has been restored.', DATE_SUB(NOW(), INTERVAL 168 HOUR), DATE_SUB(NOW(), INTERVAL 48 HOUR), @admin, @admin, @sofia, @category_network, @priority_medium, @status_resolved),
    (5, 'Administrative email configuration', 'A minor email configuration problem was resolved and closed.', DATE_SUB(NOW(), INTERVAL 240 HOUR), DATE_SUB(NOW(), INTERVAL 120 HOUR), @admin, @admin, @technician, @category_email, @priority_low, @status_closed),
    (6, 'Security console unavailable', 'The technician cannot access the corporate security console.', DATE_SUB(NOW(), INTERVAL 24 HOUR), DATE_SUB(NOW(), INTERVAL 16 HOUR), @technician, @technician, NULL, @category_security, @priority_critical, @status_open),
    (7, 'Technician network connectivity problem', 'The technician workstation has intermittent network connectivity.', DATE_SUB(NOW(), INTERVAL 72 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR), @technician, @technician, @technician, @category_network, @priority_high, @status_in_progress),
    (8, 'Support software license pending', 'The technician is waiting for approval of a support software license.', DATE_SUB(NOW(), INTERVAL 120 HOUR), DATE_SUB(NOW(), INTERVAL 8 HOUR), @technician, @technician, @sofia, @category_software, @priority_medium, @status_waiting),
    (9, 'Technician email synchronization resolved', 'The email synchronization problem has been resolved.', DATE_SUB(NOW(), INTERVAL 168 HOUR), DATE_SUB(NOW(), INTERVAL 48 HOUR), @technician, @technician, @technician, @category_email, @priority_medium, @status_resolved),
    (10, 'Technician monitor configuration', 'The secondary monitor configuration was corrected and the ticket was closed.', DATE_SUB(NOW(), INTERVAL 240 HOUR), DATE_SUB(NOW(), INTERVAL 96 HOUR), @technician, @technician, @mario, @category_hardware, @priority_low, @status_closed),
    (11, 'Suspicious login detected', 'The user received a login notification from an unknown location.', DATE_SUB(NOW(), INTERVAL 24 HOUR), DATE_SUB(NOW(), INTERVAL 18 HOUR), @user, @user, NULL, @category_security, @priority_critical, @status_open),
    (12, 'Corporate VPN connection failure', 'The user cannot connect to the corporate VPN while working remotely.', DATE_SUB(NOW(), INTERVAL 72 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR), @user, @user, @technician, @category_network, @priority_high, @status_in_progress),
    (13, 'Excel report application error', 'Excel closes unexpectedly when opening a specific report.', DATE_SUB(NOW(), INTERVAL 96 HOUR), DATE_SUB(NOW(), INTERVAL 24 HOUR), @user, @user, @technician, @category_software, @priority_medium, @status_waiting),
    (14, 'Password access problem resolved', 'The user password was reset and access has been restored.', DATE_SUB(NOW(), INTERVAL 144 HOUR), DATE_SUB(NOW(), INTERVAL 48 HOUR), @user, @user, @sofia, @category_access, @priority_medium, @status_resolved),
    (15, 'Keyboard replacement completed', 'The defective keyboard was replaced and the incident was closed.', DATE_SUB(NOW(), INTERVAL 216 HOUR), DATE_SUB(NOW(), INTERVAL 96 HOUR), @user, @user, @technician, @category_hardware, @priority_low, @status_closed),
    (16, 'Sales laptop running slowly', 'The laptop used by the sales team is very slow when opening CRM reports.', DATE_SUB(NOW(), INTERVAL 48 HOUR), DATE_SUB(NOW(), INTERVAL 36 HOUR), @pablo, @pablo, NULL, @category_hardware, @priority_medium, @status_open),
    (17, 'Sales MFA prompts repeatedly', 'Multi-factor authentication prompts appear repeatedly when accessing the CRM.', DATE_SUB(NOW(), INTERVAL 72 HOUR), DATE_SUB(NOW(), INTERVAL 6 HOUR), @pablo, @pablo, @mario, @category_access, @priority_high, @status_in_progress),
    (18, 'Human Resources mailbox restored', 'The Human Resources shared mailbox can send and receive messages again.', DATE_SUB(NOW(), INTERVAL 96 HOUR), DATE_SUB(NOW(), INTERVAL 48 HOUR), @lucia, @lucia, @sofia, @category_email, @priority_medium, @status_resolved);

-- ------------------------------------------------------------
-- 4. COMMENTS (public and internal), grouped by ticket
-- ------------------------------------------------------------
-- Ticket #1: Critical access to administration portal
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (1, @admin, 'The administration portal is still unavailable.', FALSE, DATE_SUB(NOW(), INTERVAL 20 HOUR)),
    (1, @admin, 'Authentication logs are being reviewed.', TRUE, DATE_SUB(NOW(), INTERVAL 18 HOUR));

-- Ticket #2: Administrative security permissions issue
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (2, @admin, 'Administrative permissions are still failing.', FALSE, DATE_SUB(NOW(), INTERVAL 48 HOUR)),
    (2, @technician, 'Reviewing the affected roles and access policies.', TRUE, DATE_SUB(NOW(), INTERVAL 24 HOUR)),
    (2, @technician, 'The issue is currently under investigation.', FALSE, DATE_SUB(NOW(), INTERVAL 4 HOUR));

-- Ticket #3: Administration software update pending
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (3, @sofia, 'The software update requires vendor approval.', TRUE, DATE_SUB(NOW(), INTERVAL 36 HOUR)),
    (3, @admin, 'Please let me know when the vendor confirms the update.', FALSE, DATE_SUB(NOW(), INTERVAL 12 HOUR));

-- Ticket #4: Administrative VPN problem resolved
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (4, @sofia, 'VPN configuration has been corrected.', FALSE, DATE_SUB(NOW(), INTERVAL 72 HOUR)),
    (4, @admin, 'I have tested the VPN and it is working correctly now.', FALSE, DATE_SUB(NOW(), INTERVAL 48 HOUR));

-- Ticket #5: Administrative email configuration
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (5, @technician, 'Email configuration was updated successfully.', FALSE, DATE_SUB(NOW(), INTERVAL 144 HOUR)),
    (5, @admin, 'Confirmed. Everything is working correctly.', FALSE, DATE_SUB(NOW(), INTERVAL 120 HOUR));

-- Ticket #6: Security console unavailable
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (6, @technician, 'The security console still returns an access error.', FALSE, DATE_SUB(NOW(), INTERVAL 20 HOUR)),
    (6, @admin, 'Security permissions will be reviewed.', TRUE, DATE_SUB(NOW(), INTERVAL 16 HOUR));

-- Ticket #7: Technician network connectivity problem
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (7, @technician, 'Network connectivity continues to be intermittent.', FALSE, DATE_SUB(NOW(), INTERVAL 48 HOUR)),
    (7, @technician, 'Network logs show packet loss on this workstation.', TRUE, DATE_SUB(NOW(), INTERVAL 24 HOUR)),
    (7, @technician, 'Network configuration is being reviewed.', FALSE, DATE_SUB(NOW(), INTERVAL 6 HOUR));

-- Ticket #8: Support software license pending
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (8, @technician, 'Is there any update regarding the software license?', FALSE, DATE_SUB(NOW(), INTERVAL 48 HOUR)),
    (8, @sofia, 'License request has been submitted to the provider.', TRUE, DATE_SUB(NOW(), INTERVAL 24 HOUR)),
    (8, @sofia, 'We are waiting for provider approval.', FALSE, DATE_SUB(NOW(), INTERVAL 10 HOUR));

-- Ticket #9: Technician email synchronization resolved
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (9, @technician, 'The Outlook profile has been rebuilt.', FALSE, DATE_SUB(NOW(), INTERVAL 72 HOUR)),
    (9, @technician, 'Synchronization is working correctly now.', FALSE, DATE_SUB(NOW(), INTERVAL 48 HOUR));

-- Ticket #10: Technician monitor configuration
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (10, @mario, 'The secondary monitor is now working correctly.', FALSE, DATE_SUB(NOW(), INTERVAL 120 HOUR)),
    (10, @admin, 'Issue confirmed as resolved. Closing ticket.', TRUE, DATE_SUB(NOW(), INTERVAL 96 HOUR));

-- Ticket #11: Suspicious login detected
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (11, @user, 'I confirm that I did not perform this login.', FALSE, DATE_SUB(NOW(), INTERVAL 20 HOUR)),
    (11, @admin, 'Potential account compromise; reviewing authentication logs.', TRUE, DATE_SUB(NOW(), INTERVAL 18 HOUR));

-- Ticket #12: Corporate VPN connection failure
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (12, @user, 'The VPN still fails after entering my credentials.', FALSE, DATE_SUB(NOW(), INTERVAL 60 HOUR)),
    (12, @technician, 'Possible VPN profile corruption; reviewing configuration.', TRUE, DATE_SUB(NOW(), INTERVAL 55 HOUR)),
    (12, @user, 'I restarted the laptop but the problem continues.', FALSE, DATE_SUB(NOW(), INTERVAL 50 HOUR)),
    (12, @technician, 'The user credentials appear to be valid.', TRUE, DATE_SUB(NOW(), INTERVAL 44 HOUR)),
    (12, @technician, 'A new VPN profile has been generated.', FALSE, DATE_SUB(NOW(), INTERVAL 37 HOUR)),
    (12, @user, 'I installed the profile but I still cannot connect.', FALSE, DATE_SUB(NOW(), INTERVAL 30 HOUR)),
    (12, @technician, 'Checking firewall and network access rules.', TRUE, DATE_SUB(NOW(), INTERVAL 25 HOUR)),
    (12, @technician, 'The firewall configuration looks correct.', TRUE, DATE_SUB(NOW(), INTERVAL 20 HOUR)),
    (12, @user, 'The error message now says connection timed out.', FALSE, DATE_SUB(NOW(), INTERVAL 15 HOUR)),
    (12, @technician, 'The VPN gateway configuration is being reviewed.', TRUE, DATE_SUB(NOW(), INTERVAL 10 HOUR)),
    (12, @technician, 'Another VPN profile is being prepared.', FALSE, DATE_SUB(NOW(), INTERVAL 4 HOUR));

-- Ticket #13: Excel report application error
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (13, @user, 'The error only happens with one specific Excel report.', FALSE, DATE_SUB(NOW(), INTERVAL 48 HOUR)),
    (13, @technician, 'Waiting for the affected Excel document.', TRUE, DATE_SUB(NOW(), INTERVAL 24 HOUR));

-- Ticket #14: Password access problem resolved
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (14, @sofia, 'The password has been reset successfully.', FALSE, DATE_SUB(NOW(), INTERVAL 72 HOUR)),
    (14, @user, 'I can access my account again. Thank you.', FALSE, DATE_SUB(NOW(), INTERVAL 48 HOUR));

-- Ticket #15: Keyboard replacement completed
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (15, @technician, 'The defective keyboard has been replaced.', FALSE, DATE_SUB(NOW(), INTERVAL 120 HOUR)),
    (15, @user, 'The new keyboard is working correctly.', FALSE, DATE_SUB(NOW(), INTERVAL 96 HOUR));

-- Ticket #16: Sales laptop running slowly
INSERT INTO ticket_comments (id_ticket, id_user, comment, internal, created_at) VALUES
    (16, @pablo, 'The laptop is slow even after a restart.', FALSE, DATE_SUB(NOW(), INTERVAL 40 HOUR)),
    (16, @admin, 'Hardware diagnostic pending technician assignment.', TRUE, DATE_SUB(NOW(), INTERVAL 36 HOUR));

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
-- 5. TICKET HISTORY (creation, assignment, status changes...)
-- ------------------------------------------------------------
-- Ticket #1: Critical access to administration portal
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (1, @admin, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 24 HOUR));

-- Ticket #2: Administrative security permissions issue
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (2, @admin, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 72 HOUR)),
    (2, @admin, 'ASSIGNED', 'assignedTo', NULL, 'technician', DATE_SUB(NOW(), INTERVAL 58 HOUR)),
    (2, @technician, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 22 HOUR));

-- Ticket #3: Administration software update pending
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (3, @admin, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 96 HOUR)),
    (3, @admin, 'ASSIGNED', 'assignedTo', NULL, 'tech.sofia', DATE_SUB(NOW(), INTERVAL 78 HOUR)),
    (3, @sofia, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 51 HOUR)),
    (3, @sofia, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'WAITING', DATE_SUB(NOW(), INTERVAL 6 HOUR));

-- Ticket #4: Administrative VPN problem resolved
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (4, @admin, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 168 HOUR)),
    (4, @admin, 'ASSIGNED', 'assignedTo', NULL, 'tech.sofia', DATE_SUB(NOW(), INTERVAL 144 HOUR)),
    (4, @sofia, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 108 HOUR)),
    (4, @sofia, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 48 HOUR));

-- Ticket #5: Administrative email configuration
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (5, @admin, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 240 HOUR)),
    (5, @admin, 'ASSIGNED', 'assignedTo', NULL, 'technician', DATE_SUB(NOW(), INTERVAL 216 HOUR)),
    (5, @technician, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 180 HOUR)),
    (5, @technician, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 146 HOUR)),
    (5, @technician, 'STATUS_CHANGED', 'status', 'RESOLVED', 'CLOSED', DATE_SUB(NOW(), INTERVAL 120 HOUR));

-- Ticket #6: Security console unavailable
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (6, @technician, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 24 HOUR));

-- Ticket #7: Technician network connectivity problem
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (7, @technician, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 72 HOUR)),
    (7, @admin, 'ASSIGNED', 'assignedTo', NULL, 'technician', DATE_SUB(NOW(), INTERVAL 58 HOUR)),
    (7, @technician, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 22 HOUR));

-- Ticket #8: Support software license pending
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (8, @technician, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 120 HOUR)),
    (8, @admin, 'ASSIGNED', 'assignedTo', NULL, 'tech.sofia', DATE_SUB(NOW(), INTERVAL 98 HOUR)),
    (8, @sofia, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 64 HOUR)),
    (8, @sofia, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'WAITING', DATE_SUB(NOW(), INTERVAL 8 HOUR));

-- Ticket #9: Technician email synchronization resolved
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (9, @technician, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 168 HOUR)),
    (9, @admin, 'ASSIGNED', 'assignedTo', NULL, 'technician', DATE_SUB(NOW(), INTERVAL 144 HOUR)),
    (9, @technician, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 108 HOUR)),
    (9, @technician, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 48 HOUR));

-- Ticket #10: Technician monitor configuration
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (10, @technician, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 240 HOUR)),
    (10, @admin, 'ASSIGNED', 'assignedTo', NULL, 'tech.mario', DATE_SUB(NOW(), INTERVAL 211 HOUR)),
    (10, @mario, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 168 HOUR)),
    (10, @mario, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 128 HOUR)),
    (10, @mario, 'STATUS_CHANGED', 'status', 'RESOLVED', 'CLOSED', DATE_SUB(NOW(), INTERVAL 96 HOUR));

-- Ticket #11: Suspicious login detected
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (11, @user, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 24 HOUR)),
    (11, @admin, 'PRIORITY_CHANGED', 'priority', 'HIGH', 'CRITICAL', DATE_SUB(NOW(), INTERVAL 21 HOUR));

-- Ticket #12: Corporate VPN connection failure
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (12, @user, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 72 HOUR)),
    (12, @admin, 'ASSIGNED', 'assignedTo', NULL, 'technician', DATE_SUB(NOW(), INTERVAL 58 HOUR)),
    (12, @user, 'TITLE_CHANGED', 'title', 'VPN problem', 'Corporate VPN connection failure', DATE_SUB(NOW(), INTERVAL 52 HOUR)),
    (12, @user, 'DESCRIPTION_CHANGED', 'description', 'The VPN is not working.', 'The user cannot connect to the corporate VPN while working remotely.', DATE_SUB(NOW(), INTERVAL 45 HOUR)),
    (12, @admin, 'PRIORITY_CHANGED', 'priority', 'MEDIUM', 'HIGH', DATE_SUB(NOW(), INTERVAL 39 HOUR)),
    (12, @technician, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 23 HOUR));

-- Ticket #13: Excel report application error
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (13, @user, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 96 HOUR)),
    (13, @admin, 'ASSIGNED', 'assignedTo', NULL, 'technician', DATE_SUB(NOW(), INTERVAL 82 HOUR)),
    (13, @user, 'DESCRIPTION_CHANGED', 'description', 'Excel does not work correctly.', 'Excel closes unexpectedly when opening a specific report.', DATE_SUB(NOW(), INTERVAL 74 HOUR)),
    (13, @technician, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 60 HOUR)),
    (13, @technician, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'WAITING', DATE_SUB(NOW(), INTERVAL 24 HOUR));

-- Ticket #14: Password access problem resolved
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (14, @user, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 144 HOUR)),
    (14, @admin, 'ASSIGNED', 'assignedTo', NULL, 'tech.sofia', DATE_SUB(NOW(), INTERVAL 125 HOUR)),
    (14, @admin, 'CATEGORY_CHANGED', 'category', 'Software', 'Access', DATE_SUB(NOW(), INTERVAL 115 HOUR)),
    (14, @sofia, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 96 HOUR)),
    (14, @sofia, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 48 HOUR));

-- Ticket #15: Keyboard replacement completed
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (15, @user, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 216 HOUR)),
    (15, @admin, 'ASSIGNED', 'assignedTo', NULL, 'tech.mario', DATE_SUB(NOW(), INTERVAL 192 HOUR)),
    (15, @admin, 'REASSIGNED', 'assignedTo', 'tech.mario', 'technician', DATE_SUB(NOW(), INTERVAL 174 HOUR)),
    (15, @technician, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 156 HOUR)),
    (15, @technician, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 122 HOUR)),
    (15, @technician, 'STATUS_CHANGED', 'status', 'RESOLVED', 'CLOSED', DATE_SUB(NOW(), INTERVAL 96 HOUR));

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
    (17, @admin, 'ASSIGNED', 'assignedTo', NULL, 'tech.mario', DATE_SUB(NOW(), INTERVAL 59 HOUR)),
    (17, @mario, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 24 HOUR));

-- Ticket #18: Human Resources mailbox restored
INSERT INTO ticket_history
    (id_ticket, id_user, action, field_name, old_value, new_value, created_at)
VALUES
    (18, @lucia, 'TICKET_CREATED', NULL, NULL, NULL, DATE_SUB(NOW(), INTERVAL 96 HOUR)),
    (18, @admin, 'ASSIGNED', 'assignedTo', NULL, 'tech.sofia', DATE_SUB(NOW(), INTERVAL 86 HOUR)),
    (18, @sofia, 'STATUS_CHANGED', 'status', 'OPEN', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 72 HOUR)),
    (18, @sofia, 'STATUS_CHANGED', 'status', 'IN_PROGRESS', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 48 HOUR));

COMMIT;

-- ------------------------------------------------------------
-- 6. QUICK VERIFICATION (read-only)
-- ------------------------------------------------------------
SELECT u.username, r.name AS role, u.enabled
FROM users AS u JOIN roles AS r ON r.id_role = u.id_role
WHERE u.username IN ('admin', 'technician', 'user') ORDER BY u.username;
SELECT (SELECT COUNT(*) FROM users) AS total_users,
       (SELECT COUNT(*) FROM tickets) AS total_tickets,
       (SELECT COUNT(*) FROM ticket_comments) AS total_comments,
       (SELECT COUNT(*) FROM ticket_history) AS total_history_events;