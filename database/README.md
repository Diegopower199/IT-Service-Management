# Help Desk — Database

**English** | [Español](./README.es.md)

Help Desk / IT Service Management uses **MySQL** for relational data and file metadata and **MongoDB GridFS** for the binary contents of attachments and avatars. This directory contains the SQL initialization scripts for MySQL.

Spring Boot uses `spring.jpa.hibernate.ddl-auto=validate`. Initialize the relational schema before starting the backend. Hibernate validates the existing schema without creating or modifying tables.

## Data Model

The MySQL database is named `helpdesk`. [01_create_tables.sql](./01_create_tables.sql) defines 13 InnoDB tables.

| Area | Table | Purpose |
| --- | --- | --- |
| Configuration | `roles` | Application roles assigned to user accounts. |
| Configuration | `departments` | Departments to which users belong. |
| Configuration | `categories` | Ticket classifications. |
| Configuration | `priorities` | Ticket urgency levels. |
| Configuration | `statuses` | Ticket workflow states. |
| Users and authentication | `users` | Login identity, profile, BCrypt password hash, enabled flag, role, and department. |
| Users and authentication | `refresh_tokens` | User-linked refresh token hashes, creation and expiry timestamps, and revocation status. The stored hash is SHA-256. |
| Ticket management | `tickets` | Ticket details, timestamps, creator, user receiving support, assignee, category, priority, and status. |
| Ticket management | `ticket_comments` | Ticket conversation entries with an author and an `internal` flag. A value of `0` is public within the ticket, and `1` is internal. |
| Ticket management | `ticket_history` | Events for ticket creation, field changes, assignment, and reassignment. Records include the actor, action, timestamp, and old and new values when relevant. |
| File metadata | `ticket_attachments` | Metadata for files uploaded directly to tickets. |
| File metadata | `ticket_comment_attachments` | Metadata for files uploaded to ticket comments. |
| File metadata | `user_avatars` | Current avatar metadata, with at most one row per user. |

### Foreign keys

| Source column | Referenced column | SQL constraint |
| --- | --- | --- |
| `users.id_role` | `roles.id_role` | `FK_users_roles` |
| `users.id_department` | `departments.id_department` | `FK_users_departments` |
| `refresh_tokens.id_user` | `users.id_user` | `fk_refresh_tokens_user` |
| `tickets.id_created_by` | `users.id_user` | `FK_ticket_created_by` |
| `tickets.id_requested_for` | `users.id_user` | `FK_ticket_requested_for` |
| `tickets.id_assigned_to` | `users.id_user` | `FK_ticket_assigned_to` |
| `tickets.id_category` | `categories.id_category` | `FK_ticket_category` |
| `tickets.id_priority` | `priorities.id_priority` | `FK_ticket_priority` |
| `tickets.id_status` | `statuses.id_status` | `FK_ticket_status` |
| `ticket_comments.id_ticket` | `tickets.id_ticket` | `fk_ticket_comments_ticket` |
| `ticket_comments.id_user` | `users.id_user` | `fk_ticket_comments_user` |
| `ticket_history.id_ticket` | `tickets.id_ticket` | `fk_ticket_history_ticket` |
| `ticket_history.id_user` | `users.id_user` | `fk_ticket_history_user` |
| `ticket_attachments.id_ticket` | `tickets.id_ticket` | `fk_ticket_attachments_ticket` |
| `ticket_attachments.id_uploaded_by` | `users.id_user` | `fk_ticket_attachments_user` |
| `ticket_comment_attachments.id_ticket_comment` | `ticket_comments.id_comment` | `fk_ticket_comment_attachments_comment` |
| `ticket_comment_attachments.id_uploaded_by` | `users.id_user` | `fk_ticket_comment_attachments_user` |
| `user_avatars.id_user` | `users.id_user` | `fk_user_avatars_user` |

`id_created_by` identifies the user who submitted the ticket. `id_requested_for` identifies the user who needs support and can be the same as the creator. Both are required. `id_assigned_to` identifies the technician responsible for the ticket and can be `NULL` while it is unassigned. Spring Boot validates the assignee's role. All three foreign keys reference `users`.

### Initial reference catalogs

[02_seed_reference_data.sql](./02_seed_reference_data.sql) loads the following catalogs. All seed entries in catalogs with an `active` flag start active.

| Catalog | Initial values | Administration rules |
| --- | --- | --- |
| Roles (3) | `ADMIN`, `TECHNICIAN`, `USER` | Fixed application roles. The roles API is read-only. |
| Departments (14) | IT, Finance, Human Resources, Sales, Marketing, Legal, Operations, Security, Customer Support, Procurement, Facilities, Logistics, Product Development, Quality Assurance | Administrators can create, edit, activate, and deactivate department entries. |
| Categories (14) | Hardware, Software, Network, Access, Security, Email, Printers and Scanners, Mobile Devices, Remote Access, Cloud Services, Backup and Recovery, Collaboration Tools, Databases, Telephony | Administrators can create, edit, activate, and deactivate category entries. |
| Priorities (6) | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`, `VERY_LOW`, `URGENT` | The backend blocks edits and deactivation for `LOW`, `MEDIUM`, `HIGH`, and `CRITICAL`. Administrators can manage custom priorities such as `VERY_LOW` and `URGENT`. The critical-ticket counter uses `CRITICAL` only. |
| Statuses (5) | `OPEN`, `IN_PROGRESS`, `BLOCKED`, `RESOLVED`, `CLOSED` | The backend blocks edits and deactivation for all five seeded statuses. Administrators can create and manage additional statuses. |

## Hybrid File Storage

Spring Boot stores binary files through GridFS in the `helpdesk_attachments` database. MySQL stores the metadata for each file.

| MySQL metadata table | Row identifier | Associated user | MongoDB GridFS bucket |
| --- | --- | --- | --- |
| `ticket_attachments` | `id_attachment` | `id_uploaded_by` | `ticket_files` |
| `ticket_comment_attachments` | `id_attachment` | `id_uploaded_by` | `ticket_comment_files` |
| `user_avatars` | `id_avatar` | `id_user` | `user_avatars` |

Each row stores `file_name`, `content_type` (MIME type), `file_size` (bytes), and `mongo_file_id`. The last field stores the 24-character hexadecimal ObjectId of the GridFS file in the corresponding bucket. Its value is unique within each SQL metadata table. The `uq_user_avatars_user` constraint limits each user to one avatar metadata row.

Each GridFS bucket uses its own `.files` collection for file records and a `.chunks` collection for binary chunks. For example, the `ticket_files` bucket uses `ticket_files.files` and `ticket_files.chunks`. GridFS creates its collections as needed, so a fresh database may have no collections until the first upload to a bucket. MongoDB needs no SQL initialization script.

MySQL and MongoDB do not share a distributed transaction. The backend attempts cleanup in the following cases.

- **Ticket and comment attachments.** The backend stores the binary file first and flushes the SQL metadata write. If the metadata operation throws, the backend attempts to delete the new GridFS file.
- **Avatar upload or replacement.** The backend attempts to remove the new GridFS file if the SQL transaction rolls back. After a successful commit, it attempts to remove the previous file if one existed.
- **Avatar deletion.** The backend deletes the SQL row and attempts GridFS deletion after the SQL commit.

These cleanup operations are best effort. A failure can leave an unreferenced file in GridFS. Backups and restores must account for the metadata and the files together.

## SQL Initialization Scripts

Run the applicable scripts in order when setting up a new database. The script under `local/` is a manual preparation step.

| Script | Description |
| --- | --- |
| `local/00_setup_local_database.sql` | Creates `helpdesk` with `utf8mb4` and `utf8mb4_0900_ai_ci` and displays its definition. Configure the MySQL account and its grants separately when needed. |
| `01_create_tables.sql` | Creates the 13 tables, relationships, and constraints. |
| `02_seed_reference_data.sql` | Loads the initial roles, departments, categories, priorities, and statuses. |
| `03_seed_admin.sql` | Creates the private application administrator `admin` when the owner has prepared this local file. It is excluded by [database/.gitignore](./.gitignore) and absent from a fresh clone. |
| `04_seed_demo_data.sql` | Loads public demo accounts, additional test users, sample tickets, comments, and history. Include it for test and portfolio demo environments. |

The schema and seed scripts are intended for a new, empty database. Run `01` and then `02`. Run `03` if the private seed is available, then `04` if you need the demo data. The demo script looks up the catalogs from `02` and uses accounts it inserts itself, including `admin_demo`. It can run after `02` without the private seed. The schema and seed scripts are not designed for repeated execution. The project has no automatic schema migration tool.

## Setup with Docker (recommended)

From the repository root, configure `.env` or `.env.dev` as described in the [main README](../README.md#getting-started-with-docker). Start the environment you want to use.

```bash
# Compiled environment
docker compose up -d --build

# Development environment
docker compose --env-file .env.dev -f docker-compose.dev.yaml up -d --build
```

Both Compose files use `mysql:8.4` and `mongo:8.0`. On first initialization with an empty MySQL data volume, the MySQL image creates the `helpdesk` database and the application database account from `MYSQL_DATABASE`, `MYSQL_USER`, and `MYSQL_PASSWORD`. The `database/` directory is mounted read-only at `/docker-entrypoint-initdb.d`. MySQL runs the SQL files at the root of that directory in filename order, including `03_seed_admin.sql` only if it exists locally. The entrypoint does not run the script under `database/local/`.

The MySQL healthcheck runs `SELECT 1` over TCP with the configured application database account. The MongoDB healthcheck runs `db.adminCommand('ping')`. The backend waits until both checks pass. The database ports are available on the Compose network and are not published to the host.

### Persistent volumes

| Data | DEV volume | Local PROD volume |
| --- | --- | --- |
| MySQL | `helpdesk-dev_mysql_data` | `helpdesk-prod_mysql_data` |
| MongoDB | `helpdesk-dev_mongo_data` | `helpdesk-prod_mongo_data` |

Each environment uses its own named volumes. Recreating containers preserves the data in those volumes. Reusing an initialized MySQL volume skips the SQL scripts, even if the files have changed. Apply schema changes explicitly to existing databases when needed.

**Warning.** `docker compose down -v` can remove the selected project's named volumes and permanently delete its persisted MySQL and MongoDB data. Routine shutdown uses `docker compose down` or the corresponding DEV command without the volume flag.

To preserve attachments and avatars, coordinate backups and restores of both databases. A MySQL backup includes the references to files. The binary contents must be backed up from the corresponding MongoDB database.

## Manual Setup (without Docker)

Use MySQL 8.4 or another compatible MySQL 8 server, MongoDB 8.0, and a SQL client such as the `mysql` command-line client or MySQL Workbench.

1. Start MySQL and MongoDB locally.
2. Connect with a MySQL account authorized to create the database and initialize the schema. In the `mysql` command-line client started from the repository root, run the SQL files with `SOURCE`. In MySQL Workbench, open and execute the files in the same order.

   ```sql
   SOURCE database/local/00_setup_local_database.sql;
   SOURCE database/01_create_tables.sql;
   SOURCE database/02_seed_reference_data.sql;
   ```

   Run `SOURCE database/03_seed_admin.sql;` if you have prepared the private administrator script. Run `SOURCE database/04_seed_demo_data.sql;` if you want the demo data.

3. Ensure the account used by Spring Boot can connect and has the required permissions on `helpdesk`. Creating the schema does not configure the application database account. MySQL connection credentials are distinct from application login credentials.
4. Set the backend database environment variables. Replace the example username and password with those of your MySQL application account.

```dotenv
DB_URL=jdbc:mysql://localhost:3306/helpdesk
DB_USERNAME=helpdesk
DB_PASSWORD=replace_with_your_password
MONGODB_URI=mongodb://localhost:27017/helpdesk_attachments
```

The local MongoDB URI matches the default in [application.properties](../back-end/src/main/resources/application.properties). MongoDB creates storage as GridFS needs it. Finish SQL initialization before starting Spring Boot. Set the remaining backend variables using the [Backend README](../back-end/README.md). Keep real credentials out of Git.

## Demo Accounts and Data

The [demo seed](./04_seed_demo_data.sql) creates these three public accounts for the portfolio demonstration. Their credentials are listed under [Demo accounts in the main README](../README.md#demo-accounts).

| Username | Role |
| --- | --- |
| `admin_demo` | `ADMIN` |
| `technician_demo` | `TECHNICIAN` |
| `user_demo` | `USER` |

| Records inserted by `04_seed_demo_data.sql` | Count |
| --- | ---: |
| Users, including the three public accounts | 15 |
| Tickets | 60 |
| Ticket comments | 175 |
| Ticket history events | 218 |

The private application account `admin` is created separately by `03_seed_admin.sql` when the file is available. A fresh schema seeded with both files has 16 users. The demo seed stores BCrypt password hashes and includes tickets that vary by creator, user receiving support, technician assignment, priority, category, and status. It includes unassigned tickets and both public and internal comments.

## Verify the Setup

### MySQL schema and seed data

Use the configured MySQL application username in place of `helpdesk` if it differs. The `-p` option prompts for the password.

```bash
# Manual MySQL installation
mysql -h 127.0.0.1 -P 3306 -u helpdesk -p helpdesk

# Docker PROD
docker compose exec mysql mysql -u helpdesk -p helpdesk

# Docker DEV
docker compose --env-file .env.dev -f docker-compose.dev.yaml exec mysql mysql -u helpdesk -p helpdesk
```

Run these read-only checks. Compare counts with the reference catalog and demo totals above for a newly initialized database using the corresponding seeds.

```sql
USE helpdesk;
SHOW TABLES;

SELECT 'roles' AS catalog, COUNT(*) AS total FROM roles
UNION ALL SELECT 'departments', COUNT(*) FROM departments
UNION ALL SELECT 'categories', COUNT(*) FROM categories
UNION ALL SELECT 'priorities', COUNT(*) FROM priorities
UNION ALL SELECT 'statuses', COUNT(*) FROM statuses;

SELECT u.username, r.name AS role
FROM users u
JOIN roles r ON u.id_role = r.id_role
WHERE u.username IN ('admin', 'admin_demo', 'technician_demo', 'user_demo')
ORDER BY u.username;

SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_tickets FROM tickets;
SELECT COUNT(*) AS total_comments FROM ticket_comments;
SELECT COUNT(*) AS total_history_events FROM ticket_history;
```

### MongoDB and file integrity

Open `mongosh` in the environment you are checking.

```bash
# Manual MongoDB installation
mongosh "mongodb://localhost:27017/helpdesk_attachments"

# Docker PROD
docker compose exec mongodb mongosh helpdesk_attachments

# Docker DEV
docker compose --env-file .env.dev -f docker-compose.dev.yaml exec mongodb mongosh helpdesk_attachments
```

```text
db.runCommand({ ping: 1 })
show collections
```

A successful ping confirms MongoDB can respond. An empty collection list is expected in a fresh environment before any files are uploaded. To verify storage end to end, start the application, upload a test file, and read its matching metadata from the appropriate table. The example below includes metadata counts and the latest ticket attachment row.

```sql
SELECT COUNT(*) AS total_ticket_attachments FROM ticket_attachments;
SELECT COUNT(*) AS total_comment_attachments FROM ticket_comment_attachments;
SELECT COUNT(*) AS total_avatars FROM user_avatars;

SELECT id_attachment, id_ticket, id_uploaded_by, file_name, content_type, file_size, mongo_file_id
FROM ticket_attachments
ORDER BY id_attachment DESC
LIMIT 1;
```

In `mongosh`, replace the example ObjectId with the `mongo_file_id` from that row. Check the file record and its binary chunks.

```javascript
const fileId = ObjectId("000000000000000000000000")
db.getCollection("ticket_files.files").findOne({ _id: fileId }, { filename: 1, length: 1 })
db.getCollection("ticket_files.chunks").countDocuments({ files_id: fileId })
```

Compare the GridFS filename and byte length with the SQL metadata and retrieve the file through the UI. For a comment attachment or avatar, use its SQL table and GridFS bucket from the mapping above.

## Local and Cloud Databases

| Environment | Relational storage | Binary file storage | Backend configuration |
| --- | --- | --- | --- |
| Local | MySQL in Docker or installed directly | Local MongoDB GridFS | Compose supplies the service connection settings. For manual setup, set `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and `MONGODB_URI` as shown above. |
| Cloud | TiDB Cloud, using its MySQL-compatible interface | MongoDB Atlas GridFS | Spring Boot runs on Render. Set the same environment variables there with the values for the hosted services. |

See the [cloud architecture in the main README](../README.md#cloud-architecture) for application context.

## Deployment Considerations

The supplied Compose files are for local use and do not configure MongoDB authentication. For hosted environments, enable database authentication, use least-privilege database accounts, store credentials as deployment secrets, and prepare coordinated backup and restore procedures for both databases.

The public portfolio demo uses test data only. Spring Boot allows `admin_demo` to manage unprotected regular and technician accounts and prevents it from editing `admin`, `admin_demo`, `technician_demo`, and `user_demo` or granting the `ADMIN` role. The three public accounts can upload, replace, and delete their own avatars. Their personal details are read-only, and password changes are disabled. The private `admin` account is separate from the public demo.

For a real enterprise production environment, exclude the demo seed and public demo accounts, and review security and operating procedures before using business data.
