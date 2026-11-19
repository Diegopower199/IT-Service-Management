# Help Desk — Database

The Help Desk / IT Service Management application uses two databases: **MySQL** for relational business data and file metadata, and **MongoDB GridFS** for binary file storage. This directory contains the MySQL initialization scripts.

Hibernate validates the existing relational schema without creating or modifying tables.

## Data Model

| Area                        | MySQL tables                                                       |
| --------------------------- | ------------------------------------------------------------------ |
| Configuration               | `roles`, `departments`, `categories`, `priorities`, `statuses`     |
| Identity and authentication | `users`, `refresh_tokens`                                          |
| Ticket management           | `tickets`, `ticket_comments`, `ticket_history`                     |
| File metadata               | `ticket_attachments`, `ticket_comment_attachments`, `user_avatars` |

The MySQL database is named `helpdesk`. The MongoDB database is named `helpdesk_attachments`.

## Hybrid File Storage

| MySQL metadata table         | MongoDB GridFS bucket  | Contents                       |
| ---------------------------- | ---------------------- | ------------------------------ |
| `ticket_attachments`         | `ticket_files`         | Ticket documents and images    |
| `ticket_comment_attachments` | `ticket_comment_files` | Files associated with comments |
| `user_avatars`               | `user_avatars`         | User profile images            |

MySQL stores metadata and a `mongo_file_id` reference to the corresponding GridFS file. Each bucket manages its own `.files` and `.chunks` collections in MongoDB. The avatar table enforces one avatar per user. File storage is initialized as needed through the backend; no MongoDB initialization script is required.

## SQL Initialization Scripts

Execute these scripts **in order** when setting up a new database manually:

| Script                       | Description                                             |
| ---------------------------- | ------------------------------------------------------- |
| `00_create_database.sql`     | Creates the local MySQL account, database, and grants   |
| `01_create_tables.sql`       | Creates the core tables, relationships, and constraints |
| `02_seed_data.sql`           | Inserts demo accounts and sample business data          |
| `03_create_file_storage.sql` | Creates the three file metadata tables                  |

The full script sequence is intended for a new, empty database. Do not rerun it against an existing database containing important data. No automatic schema migration tool is configured.

## Setup with Docker (recommended)

From the repository root, configure `.env` or `.env.dev` as described in the [main README](../README.md). Start either environment:

```bash
# Compiled environment
docker compose up -d --build

# Development environment
docker compose --env-file .env.dev -f docker-compose.dev.yaml up -d --build
```

Docker Compose uses `mysql:8.4` and `mongo:8.0`. The `database/` directory is mounted read-only into `/docker-entrypoint-initdb.d`, so MySQL executes the SQL scripts automatically on its first initialization with an empty data directory. Compose also creates the application database and database account from the environment variables. The SQL creation script separately defines a local-only account; its credentials must not be treated as production secrets.

Both databases have healthchecks. The backend waits for them before starting. Their ports are not published to the host in the current Compose files.

### Persistent volumes

| Data    | DEV volume                | PROD volume                |
| ------- | ------------------------- | -------------------------- |
| MySQL   | `helpdesk-dev_mysql_data` | `helpdesk-prod_mysql_data` |
| MongoDB | `helpdesk-dev_mongo_data` | `helpdesk-prod_mongo_data` |

The two environments use independent named volumes. Recreating containers does not remove their database contents. The SQL initialization scripts do **not** run again when an initialized MySQL volume is reused. Apply schema changes explicitly if needed.

**Warning:** `docker compose down -v` removes the project's declared volumes and their stored data. Do not use it unless you intend to reset that environment. Back up both databases together where possible; a MySQL-only backup does not include the actual attachments or avatars.

## Manual Setup (without Docker)

Requirements: MySQL 8.4 (or a compatible MySQL 8 server), MongoDB 8.0, and a SQL client such as MySQL Workbench.

1. Start MySQL and MongoDB locally.
2. Review `00_create_database.sql` and set your own local database password before execution. Run the SQL scripts listed above using a MySQL administrative account.
3. Configure the backend environment variables with the matching database credentials and MongoDB URI:

```dotenv
DB_URL=jdbc:mysql://localhost:3306/helpdesk
DB_USERNAME=helpdesk
DB_PASSWORD=replace_with_your_password
MONGODB_URI=mongodb://localhost:27017/helpdesk_attachments
```

The remaining backend settings are described in the [Backend README](../back-end/README.md). Do not commit real credentials.

In `back-end/src/main/resources/application.properties`, the existing setting is:

```properties
spring.jpa.hibernate.ddl-auto=validate
```

Hibernate validates the database schema; it does not automatically create or modify tables.

## Demo Accounts

The seed script creates three main accounts for testing the application roles.

| Username     | Role       |
| ------------ | ---------- |
| `admin`      | ADMIN      |
| `technician` | TECHNICIAN |
| `user`       | USER       |

Additional users, tickets, comments and history records are included. Demo accounts use the BCrypt password hash in `02_seed_data.sql`; see the [main README](../README.md) for demonstration login details. These accounts are intended for local demonstrations only.

## Verify the Setup

For a local MySQL installation, connect with a SQL client. For Docker PROD, open a MySQL session using the configured application user (replace `helpdesk` if you chose another username):

```bash
docker compose exec mysql mysql -u helpdesk -p helpdesk
```

For DEV, prepend `docker compose --env-file .env.dev -f docker-compose.dev.yaml` instead of `docker compose`.

Run:

```sql
USE helpdesk;
SHOW TABLES;

SELECT u.username, r.name AS role
FROM users u
JOIN roles r ON u.id_role = r.id_role;

SELECT COUNT(*) AS total_tickets FROM tickets;
SELECT COUNT(*) AS total_ticket_attachments FROM ticket_attachments;
SELECT COUNT(*) AS total_comment_attachments FROM ticket_comment_attachments;
SELECT COUNT(*) AS total_avatars FROM user_avatars;
```

Check MongoDB in PROD:

```bash
docker compose exec mongodb mongosh helpdesk_attachments
```

```javascript
db.runCommand({ ping: 1 })
show collections
```

In a fresh environment, GridFS collections may appear only after files are uploaded. To verify the complete storage flow, start the application, upload a test attachment or avatar, and verify that the metadata and binary file are both present and that the file can be retrieved through the UI.

## Deployment Considerations

The supplied Compose configuration is for local use. MongoDB authentication is not configured in it. Before a public deployment, configure database authentication, least-privilege accounts, secure secrets, backup and restore procedures, and remove demo accounts. Keep MySQL metadata and MongoDB files consistent during backups and restores.
