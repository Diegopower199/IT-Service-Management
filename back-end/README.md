# Help Desk — Backend

REST API for a full-stack **IT Service Management (ITSM)** application. It handles authentication, users, ticket management, assignments, comments, audit history, dashboard statistics, attachments, and user avatars.

## Tech Stack

- **Java 17** · **Spring Boot 4.1.1** · Spring MVC
- **Spring Security 7.1.1** · JWT (HS256) · BCrypt
- **Spring Data JPA** · Hibernate · **MySQL 8.4**
- **Spring Data MongoDB** · **MongoDB 8.0** · GridFS
- Jakarta Bean Validation · Lombok
- **JUnit Jupiter 6.0.3** · Mockito · Spring MockMvc · Maven Wrapper (Maven 3.10.0)

## Features

- Authentication with short-lived JWT access tokens and rotating refresh tokens.
- Role-based access for `ADMIN`, `TECHNICIAN`, and `USER`.
- User administration, personal profiles, and password changes.
- Ticket creation, updates, assignment, priority, and status management.
- Ticket search with pagination, sorting, and filters.
- Public/internal comments and an auditable change history.
- Role-aware statistics for the dashboard.
- Ticket and comment attachments with authenticated upload, download, and preview.
- User avatar upload, replacement, and removal.
- Request validation and consistent error responses.

## Project Structure

```text
src/
├── main/
│   ├── java/com/example/back_end/
│   │   ├── config/          # Application and security configuration
│   │   ├── controller/      # REST endpoints
│   │   ├── dtos/            # Request and response DTOs
│   │   ├── enums/           # Domain and storage enums
│   │   ├── exception/       # Error handling
│   │   ├── model/           # JPA entities
│   │   ├── repository/      # Database access
│   │   ├── security/        # JWT and security filters
│   │   ├── service/         # Business logic
│   │   ├── specification/   # Dynamic ticket filtering
│   │   └── utils/           # Shared utilities
│   └── resources/application.properties
└── test/java/com/example/back_end/
```

The backend is a layered Spring Boot application.

| Package | Responsibility |
| --- | --- |
| `controller` | Define REST routes, handle request validation, and build HTTP responses. |
| `service` | Apply business rules and resource authorization, and coordinate SQL and GridFS operations. |
| `repository` | Access relational data through Spring Data JPA. |
| `dtos` | Define request and response payloads, including validation constraints. |
| `model` | Map domain entities and their relationships to SQL tables. |
| `security` | Issue and validate JWTs, authenticate requests, and handle authentication failures. |
| `specification` | Compose JPA predicates for ticket search and filtering. |
| `exception` | Map application and validation exceptions to HTTP error responses. |

## Requirements

- JDK 17 or newer
- MySQL 8.4 (Docker uses `mysql:8.4`)
- MongoDB 8.0 (Docker uses `mongo:8.0`)
- Maven Wrapper (included in the repository)

## Database Setup

The SQL scripts in the repository's `database/` directory initialize the `helpdesk` schema. For manual setup, run `local/00_setup_local_database.sql` first to create the database, then configure a dedicated MySQL account with the runtime permissions the backend needs.

Run the remaining scripts against a fresh schema in this order.

1. `01_create_tables.sql` creates the tables and relationships, including file metadata.
2. `02_seed_reference_data.sql` loads the reference catalogs.
3. `03_seed_admin.sql` initializes the private administrator if the owner has prepared the file locally. Git excludes this file from the repository.
4. `04_seed_demo_data.sql` loads the demo accounts, tickets, comments, and history.

Complete schema initialization before starting Spring Boot. Hibernate validates the existing tables through the setting in `src/main/resources/application.properties`.

```properties
spring.jpa.hibernate.ddl-auto=validate
```

Docker mounts `database/` read-only at `/docker-entrypoint-initdb.d`. MySQL runs the root-level SQL files in order when it first initializes an empty volume. Reusing a volume skips the seed scripts. Use `database/local/` for manual setup.

MySQL stores the relational records and file metadata. MongoDB stores binary files in GridFS, using `helpdesk_attachments` by default in local environments. GridFS collections are created as needed. See the [Database README](../database/README.md).

## Configuration

Set these variables before starting the backend.

| Variable       | Example / purpose                                                     |
| -------------- | --------------------------------------------------------------------- |
| `DB_URL`       | `jdbc:mysql://localhost:3306/helpdesk`                                |
| `DB_USERNAME`  | MySQL application username                                            |
| `DB_PASSWORD`  | MySQL application password                                            |
| `JWT_SECRET`   | Base64-encoded signing key (at least 32 random bytes before encoding) |
| `FRONTEND_URL` | Allowed frontend origin for CORS with credentials. For manual local use, `http://localhost:3000`. |

Optional variables:

| Variable                              | Default                            |
| ------------------------------------- | ---------------------------------- |
| `SERVER_PORT`                         | Value of `PORT` when present, then `8080` |
| `PORT`                                | Fallback server port when `SERVER_PORT` is unset |
| `MONGODB_URI`                         | `mongodb://localhost:27017/helpdesk_attachments` |
| `JWT_ACCESS_TOKEN_EXPIRATION_MINUTES` | `15`                               |
| `JWT_REFRESH_TOKEN_EXPIRATION_DAYS`   | `7`                                |
| `COOKIE_SECURE`                       | `false`. Set to `true` for HTTPS deployments. |

For local execution, use the local MySQL and MongoDB connection settings. Compose supplies its service hostnames and maps the root environment files into the backend's variables. For Render, use the MySQL-compatible JDBC URL for TiDB Cloud in `DB_URL`, the database account in `DB_USERNAME` and `DB_PASSWORD`, and the Atlas connection URI in `MONGODB_URI`. Set `FRONTEND_URL` to the Vercel frontend origin.

Store production database credentials, connection URIs, and `JWT_SECRET` in the deployment environment and keep them out of Git. Use the [JWT signing key examples](../README.md#jwt-signing-key) to generate the key.

## Run with Docker

The recommended way to run the complete application is through Docker Compose from the repository root. Configure the environment files as described in the [main README](../README.md).

```bash
# Compiled environment
docker compose up -d --build

# Development environment
docker compose --env-file .env.dev -f docker-compose.dev.yaml up -d --build
```

- Local PROD API `http://localhost:8080/api/v1`.
- DEV API `http://localhost:8081/api/v1`.
- Inside Docker, the backend connects to `mysql:3306` and `mongodb:27017` using the Compose network.
- The production-mode Dockerfile builds a JAR in a Maven stage and runs it on a Java 17 JRE. The packaging step skips tests; run them separately.
- The development Dockerfile runs Maven with the source mounted into the container. To enable automatic restarts on Java source or Maven configuration changes, run the following in a separate terminal from the root:

```bash
docker compose --env-file .env.dev -f docker-compose.dev.yaml watch --no-up backend
```

Docker PROD runs the compiled backend locally. See the [Docker Workflow](../DOCKER-WORKFLOW.md) for more commands.

## Run Locally (without Docker)

Start MySQL and MongoDB, initialize the schema, and configure the environment variables. Run Maven Wrapper from `back-end/`. See [Manual Setup](../README.md#manual-setup-without-docker).

**Windows PowerShell**

```powershell
.\mvnw.cmd spring-boot:run
```

**Linux or macOS**

```bash
chmod u+x mvnw
./mvnw spring-boot:run
```

The API base URL is **`http://localhost:8080/api/v1`**.

## Cloud Deployment

Render hosts the Spring Boot API and supplies its runtime environment, including `PORT` as the fallback for `SERVER_PORT`. The API connects to TiDB Cloud and MongoDB Atlas through the same [configuration variables](#configuration) used locally. Vercel forwards `/api/v1` requests to Render through the Next.js rewrite. See the [cloud architecture in the main README](../README.md#cloud-architecture).

## Authentication and Authorization

The authentication routes below are relative to `/api/v1`. Spring Security runs without an HTTP session and uses a BCrypt `PasswordEncoder` to verify passwords.

- `POST /auth/login` verifies the username and password, returns a short-lived HS256 JWT, and sets the refresh token cookie.
- Protected requests use `Authorization: Bearer <access-token>`. The JWT filter validates the token and loads the enabled user's authorities from the database.
- `POST /auth/refresh` reads the refresh token from the cookie, validates it, revokes it, and issues a replacement cookie and a new access token. The `refresh_tokens` table stores SHA-256 hashes of refresh tokens.
- `POST /auth/logout` revokes the refresh token when supplied and expires its cookie. Previously issued access tokens are still subject to the normal JWT validation checks.

The refresh cookie is `HttpOnly`, uses `SameSite=Strict`, and is scoped to `/api/v1/auth`. Its `Secure` flag is controlled by `COOKIE_SECURE`.

### Role and Resource Access

Spring Security enforces role checks at the endpoint level. Application services use the authenticated account to check relationships to specific resources. Administrators create user accounts through the Users API.

| Role | Ticket detail and related resources |
| --- | --- |
| `ADMIN` | Access to all tickets. |
| `TECHNICIAN` | Access to tickets assigned to them and unassigned tickets. Editing ticket details and uploading ticket-level attachments require assignment to the current technician. |
| `USER` | Access to tickets they created or that were requested for them. Comment access is limited to public comments. |

Separate authorization applies to operations such as assignment and workflow changes. See the [API Overview](#api-overview).

### Demo Accounts

- `admin_demo` has role `ADMIN`. It can create and manage unprotected `USER` and `TECHNICIAN` accounts. `DemoAccountAccess` blocks `admin_demo` from editing `admin`, `admin_demo`, `technician_demo`, or `user_demo`, and from granting `ADMIN`.
- `technician_demo` and `user_demo` use their usual role permissions for tickets and comments.
- For all three demo accounts, personal details are read-only and password changes are disabled. Each can upload, replace, and delete its own avatar through the authenticated self-service routes.
- The private `admin` account retains standard administrative permissions. Keep its credentials private. See the [public demo accounts](../README.md#demo-accounts).

## File Storage

The application separates relational metadata from binary file contents. MySQL stores the file name, content type, size, owning entity, timestamps, and the GridFS file identifier. MongoDB stores the file itself.

| Feature             | MySQL table                  | GridFS bucket          | Allowed formats | Maximum file size |
| ------------------- | ---------------------------- | ---------------------- | --------------- | ----------------- |
| Ticket attachments  | `ticket_attachments`         | `ticket_files`         | PDF, JPEG, PNG  | 10 MiB            |
| Comment attachments | `ticket_comment_attachments` | `ticket_comment_files` | PDF, JPEG, PNG  | 10 MiB            |
| User avatars        | `user_avatars`               | `user_avatars`         | JPEG, PNG       | 5 MiB             |

`MongoGridFsConfig` configures the three buckets. Uploads use multipart form data with the field `file`. The backend rejects empty or oversized files, normalizes filenames, and detects file types by binary signature. Avatar uploads also check the declared content type against the detected type. The servlet limits are `10MB` per multipart file and `11MB` per request.

Attachment listing, download, and preview require access to the parent ticket and, for comment attachments, visibility of the parent comment. Uploads to a comment also require comment authorship. Downloads are served as attachments, while previews are served inline. Binary responses include `Cache-Control: no-store` and `X-Content-Type-Options: nosniff`. The avatar routes support upload, replacement, and deletion by the authenticated owner, including all three demo accounts.

SQL writes and GridFS operations run separately. For ticket and comment uploads, the service attempts to remove the new GridFS file if saving its SQL metadata fails. Avatar replacement schedules cleanup of the old GridFS file after the SQL commit or of the new file after rollback. Avatar deletion removes the SQL metadata and attempts the GridFS removal after commit. Cleanup is best effort.

## API Overview

All paths below are relative to `/api/v1`. Routes require bearer authentication unless the table specifies credentials or refresh cookie handling.

### Authentication and Users

| Method | Path | Access and purpose |
| --- | --- | --- |
| `POST` | `/auth/login` | Authenticate with a username and password. |
| `POST` | `/auth/refresh` | Renew a session using a valid refresh cookie. |
| `POST` | `/auth/logout` | Clear the cookie and revoke its refresh token when supplied. |
| `GET`, `POST` | `/users` | `ADMIN`. List or create users. Demo account rules apply to creation. |
| `GET`, `PUT` | `/users/{id}` | `ADMIN`. Read or edit a user. Demo account rules apply to edits. |
| `GET` | `/users/me` | Read the authenticated user's profile. |
| `PUT` | `/users/me` | Edit the authenticated user's personal details. Demo accounts are read-only for this operation. |
| `PUT` | `/users/change-password` | Change the authenticated user's password. Demo accounts have this action disabled. |
| `GET` | `/users/options` | `ADMIN` or `TECHNICIAN`. List enabled users for selection. |
| `GET` | `/users/technicians` | `ADMIN` or `TECHNICIAN`. List enabled technicians. |
| `GET` | `/roles` | `ADMIN`. List predefined roles. |
| `GET` | `/roles/{id}` | `ADMIN`. Read a predefined role. |

### Catalogs

In the table, `<catalog>` is one of `/departments`, `/categories`, `/priorities`, or `/statuses`.

| Method | Path | Access and purpose |
| --- | --- | --- |
| `GET` | `<catalog>` | Authenticated users. List entries. |
| `GET` | `<catalog>/active` | Authenticated users. List active entries. |
| `GET` | `<catalog>/{id}` | Authenticated users. Read one entry. |
| `POST` | `<catalog>` | `ADMIN`. Create an entry. |
| `PUT` | `<catalog>/{id}` | `ADMIN`. Update an entry. |
| `PATCH` | `<catalog>/{id}/activate` | `ADMIN`. Activate an entry. |
| `PATCH` | `<catalog>/{id}/deactivate` | `ADMIN`. Deactivate an entry, subject to catalog rules. |

### Tickets, Comments, History, and Statistics

| Method | Path | Access and purpose |
| --- | --- | --- |
| `GET` | `/tickets` | `ADMIN`. List tickets across the system. |
| `GET` | `/tickets/my` | List tickets created by or requested for the authenticated user. |
| `GET` | `/tickets/assigned` | `TECHNICIAN`. List tickets assigned to the current technician. |
| `GET` | `/tickets/{id}` | Read a ticket using the [ticket access rules](#role-and-resource-access). |
| `POST` | `/tickets` | Create a ticket. Accounts with role `USER` can create tickets for themselves. |
| `PATCH` | `/tickets/{id}` | Edit ticket details subject to ticket access. Technicians must be assigned to the ticket. |
| `PATCH` | `/tickets/{id}/assign` | `ADMIN` or `TECHNICIAN` with ticket access. The assignee must be a technician. |
| `PATCH` | `/tickets/{id}/priority` | `ADMIN` or `TECHNICIAN` with ticket access. Change the priority. |
| `PATCH` | `/tickets/{id}/status` | `ADMIN` or `TECHNICIAN` with ticket access. Change the status. |
| `GET`, `POST` | `/ticket-comments/ticket/{id}` | List or add comments with ticket access. Internal comments are limited to admins and technicians with ticket access. |
| `GET` | `/ticket-history` | `ADMIN` sees all history. `TECHNICIAN` sees history for tickets assigned to them and unassigned tickets. |
| `GET` | `/ticket-history/ticket/{ticketId}` | Read the history of a ticket with ticket access. |
| `GET` | `/tickets/statistics` | Dashboard counts cover all tickets for `ADMIN`, the technician's own assignments for `TECHNICIAN`, and tickets they created or that were requested for them for `USER`. |

### File endpoints

Ticket attachments follow the ticket access rules. A technician must be assigned to the ticket to upload a ticket-level attachment. Comment attachments also follow comment visibility rules, and only the comment author can upload files to it.

| Method | Path                                                                           | Purpose                                                           |
| ------ | ------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| GET    | `/tickets/{ticketId}/attachments`                                              | List ticket attachments                                           |
| POST   | `/tickets/{ticketId}/attachments`                                              | Upload a ticket attachment                                        |
| GET    | `/tickets/{ticketId}/attachments/{attachmentId}/download`                      | Download a file                                                   |
| GET    | `/tickets/{ticketId}/attachments/{attachmentId}/preview`                       | Preview a file                                                    |
| GET    | `/tickets/{ticketId}/comments/{commentId}/attachments`                         | List comment attachments                                          |
| POST   | `/tickets/{ticketId}/comments/{commentId}/attachments`                         | Upload a comment attachment                                       |
| GET    | `/tickets/{ticketId}/comments/{commentId}/attachments/{attachmentId}/download` | Download a comment file                                           |
| GET    | `/tickets/{ticketId}/comments/{commentId}/attachments/{attachmentId}/preview`  | Preview a comment file                                            |
| GET    | `/users/{userId}/avatar/metadata`                                              | Retrieve avatar metadata as an authenticated user. |
| GET    | `/users/{userId}/avatar`                                                       | Retrieve an avatar as an authenticated user. Returns `204` if the user exists without an avatar. |
| PUT    | `/users/me/avatar`                                                             | Upload or replace own avatar                                      |
| DELETE | `/users/me/avatar`                                                             | Remove own avatar                                                 |

### Filtering and errors

Ticket-list endpoints support pagination and sorting. Depending on the endpoint, filters include `title`, `status`, `priority`, and `category`.

Example:

```http
GET /api/v1/tickets/my?status=OPEN&page=0&size=10&sort=lastUpdated,desc
Authorization: Bearer <access-token>
```

The API returns structured JSON errors for validation failures, authentication issues, and other application errors.

## Testing

Controller and service tests use **JUnit Jupiter 6.0.3** and **Mockito**. They cover authentication, refresh token lifecycle, users, catalogs, ticket workflows, comments, and history. MockMvc authorization tests cover ticket and attachment access, protected demo accounts, ADMIN role assignment, profile and password restrictions, and avatar upload, replacement, and deletion. These tests exercise the HTTP and service behavior with mocked repositories and storage.

**Windows:**

```powershell
.\mvnw.cmd clean verify
```

**Linux / macOS:**

```bash
./mvnw clean verify
```

Run these commands from `back-end/`. Maven compiles the application, runs the configured tests, and packages the backend through `verify`. For integration checks, use a running backend with initialized MySQL and MongoDB and exercise authentication and file operations through the application.
