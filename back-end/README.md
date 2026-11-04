# Help Desk — Backend

REST API for a full-stack **IT Service Management (ITSM)** application. It handles authentication, users, ticket management, assignments, comments, audit history, and dashboard statistics.

## Tech Stack

- **Java 17** · **Spring Boot 4.1.1** · Spring MVC
- **Spring Security** · JWT · BCrypt
- **Spring Data JPA** · Hibernate · **MySQL 8+**
- Jakarta Bean Validation · Lombok
- **JUnit 5** · Mockito · Maven Wrapper

## Features

- Authentication with short-lived JWT access tokens and rotating refresh tokens.
- Role-based access for `ADMIN`, `TECHNICIAN`, and `USER`.
- User administration, personal profiles, and password changes.
- Ticket creation, updates, assignment, priority, and status management.
- Ticket search with pagination, sorting, and filters.
- Public/internal comments and an auditable change history.
- Role-aware statistics for the dashboard.
- Request validation and consistent error responses.

## Project Structure

```text
src/
├── main/
│   ├── java/com/example/back_end/
│   │   ├── config/          # Application and security configuration
│   │   ├── controller/      # REST endpoints
│   │   ├── dtos/            # Request and response DTOs
│   │   ├── exception/       # Error handling
│   │   ├── model/           # JPA entities
│   │   ├── repository/      # Database access
│   │   ├── security/        # JWT and security filters
│   │   ├── service/         # Business logic
│   │   └── specification/   # Dynamic ticket filtering
│   └── resources/application.properties
└── test/java/com/example/back_end/
```

## Requirements

- JDK 17 or newer
- MySQL 8.0+
- Maven Wrapper (included in the repository)

## Database Setup

The database schema and demo data are managed through SQL scripts in the **`database/` directory at the repository root**.

See **[Database Setup](../database/README.md)** to execute the scripts in order:

1. `00_create_database.sql` — create the database.
2. `01_create_tables.sql` — create tables and relationships.
3. `02_seed_data.sql` — load demo accounts and sample data.

After creating the schema, use this setting in `src/main/resources/application.properties`:

```properties
spring.jpa.hibernate.ddl-auto=validate
```

Hibernate validates the existing schema; it does **not** create or alter tables. Use a dedicated MySQL account with only the runtime permissions the application needs.

## Configuration

Configure the following environment variables before starting the backend:

| Variable       | Example / purpose                                                     |
| -------------- | --------------------------------------------------------------------- |
| `DB_URL`       | `jdbc:mysql://localhost:3306/helpdesk`                                |
| `DB_USERNAME`  | MySQL application username                                            |
| `DB_PASSWORD`  | MySQL application password                                            |
| `JWT_SECRET`   | Base64-encoded signing key (at least 32 random bytes before encoding) |
| `FRONTEND_URL` | `http://localhost:3000` (allowed CORS origin)                         |

Optional variables:

| Variable                              | Default                            |
| ------------------------------------- | ---------------------------------- |
| `SERVER_PORT`                         | `8080`                             |
| `JWT_ACCESS_TOKEN_EXPIRATION_MINUTES` | `15`                               |
| `JWT_REFRESH_TOKEN_EXPIRATION_DAYS`   | `7`                                |
| `COOKIE_SECURE`                       | `false` (set to `true` with HTTPS) |

Never commit real database passwords or JWT secrets to Git.

## Run Locally

From the `back-end/` directory, after starting MySQL and configuring the variables:

**Windows (PowerShell):**

```powershell
.\mvnw.cmd spring-boot:run
```

**Linux / macOS:**

```bash
./mvnw spring-boot:run
```

The API base URL is **`http://localhost:8080/api/v1`**.

## Authentication and Authorization

- `POST /auth/login` authenticates with username and password and returns an access token.
- `POST /auth/refresh` rotates the refresh token and issues a new access token.
- `POST /auth/logout` revokes the supplied refresh token and clears its cookie.
- Protected endpoints require `Authorization: Bearer <access-token>`.
- Refresh tokens are stored as hashes in MySQL and transmitted in an `HttpOnly` cookie.
- There is **no public registration**; administrators create application users.

Access to certain ticket operations also depends on the authenticated user's relationship to the ticket, not only their role.

## API Overview

All paths below are relative to `/api/v1`.

| Area            | Main endpoints                                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------------------------- |
| Authentication  | `POST /auth/login`, `/auth/refresh`, `/auth/logout`                                                             |
| Users           | `GET /users`, `POST /users`, `GET/PUT /users/{id}`, `GET/PUT /users/me`, `PUT /users/change-password`           |
| Technicians     | `GET /users/technicians`                                                                                        |
| Roles           | `GET /roles`, `GET /roles/{id}`                                                                                 |
| Catalogues      | `/departments`, `/categories`, `/priorities`, `/statuses` (listing, creation, updates, activation/deactivation) |
| Tickets         | `GET/POST /tickets`, `GET /tickets/my`, `GET /tickets/assigned`, `GET /tickets/{id}`, `PATCH /tickets/{id}`     |
| Ticket workflow | `PATCH /tickets/{id}/assign`, `/priority`, `/status`                                                            |
| Comments        | `GET/POST /ticket-comments/ticket/{id}`                                                                         |
| History         | `GET /ticket-history`, `GET /ticket-history/ticket/{ticketId}`                                                  |
| Dashboard       | `GET /tickets/statistics`                                                                                       |

Ticket-list endpoints support pagination and sorting. Depending on the endpoint, filters include `title`, `status`, `priority`, and `category`.

Example:

```http
GET /api/v1/tickets/my?status=OPEN&page=0&size=10&sort=lastUpdated,desc
Authorization: Bearer <access-token>
```

The API returns structured JSON errors for validation failures, authentication issues, and other application errors.

## Testing

Controller and service tests use **JUnit 5** and **Mockito**.

**Windows:**

```powershell
.\mvnw.cmd clean verify
```

**Linux / macOS:**

```bash
./mvnw clean verify
```

Run these checks before committing changes. Unit tests do not replace integration testing against MySQL or testing the full frontend/backend flow.
