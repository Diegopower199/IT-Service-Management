# Help Desk — IT Service Management

A full-stack **IT Service Management (ITSM)** application for managing IT support requests, tracking ticket activity, and organizing service desk operations.

Built with **Java, Spring Boot, Next.js, TypeScript, MySQL, and MongoDB**, the project demonstrates end-to-end software development, secure session management, role-based authorization, REST API design, hybrid data persistence, automated testing, and reproducible local deployment with Docker Compose.

## Features

- **Authentication and authorization:** JWT access tokens, rotating refresh tokens in HttpOnly cookies, automatic session renewal, BCrypt password hashing, and role-based access control.
- **Ticket management:** Create, update, assign, prioritize, and track support requests throughout their lifecycle.
- **Search and filtering:** Server-side pagination, sorting, and dynamic filters.
- **Comments and activity history:** Public and internal comments, with chronological tracking of ticket changes.
- **File attachments:** Upload, download, and preview PDF and image files associated with tickets or ticket comments.
- **User profiles:** Edit personal information, change passwords, and upload, replace, or remove profile pictures. Avatar changes are reflected in the application header without reloading the page.
- **Dashboard:** Role-specific statistics, recent tickets, and shortcuts.
- **Administration:** Manage users, departments, categories, priorities, and statuses, and view configured roles.
- **Internationalization:** English and Spanish interfaces with language selection.
- **Development and delivery:** Separate Docker Compose environments, automatic development reloads, and multi-stage builds for compiled application images.
- **Quality checks:** Backend and frontend automated tests, linting, and build checks.

## Tech Stack

| Layer                  | Technologies                                            |
| ---------------------- | ------------------------------------------------------- |
| Frontend               | Next.js 16 (App Router), React 19, TypeScript           |
| UI                     | Material UI, MUI X Data Grid                            |
| API client / i18n      | Axios, next-intl                                        |
| Backend                | Java 17, Spring Boot 4.1.1, Spring MVC, Spring Security |
| Authentication         | JWT (HS256), BCrypt, HttpOnly refresh-token cookies     |
| Relational persistence | MySQL 8.4, Spring Data JPA, Hibernate                   |
| File storage           | MongoDB 8.0, Spring Data MongoDB, GridFS                |
| Testing                | JUnit 5, Mockito, Vitest, React Testing Library         |
| Infrastructure         | Docker, Docker Compose, Compose Watch                   |
| Tooling                | Maven, npm, ESLint, Git                                 |

## Architecture

```mermaid
flowchart TD
    U[Browser] --> F[Next.js / React / TypeScript]
    F -->|Axios / REST API / JWT| B[Spring Boot API]
    subgraph Backend
        B --> C[Controllers]
        C --> S[Services]
        S --> R[Spring Data JPA repositories]
        S --> G[GridFS storage service]
    end
    R --> M[(MySQL)]
    G --> N[(MongoDB GridFS)]
```

The REST API (`/api/v1`) uses a layered architecture with controllers, services, repositories, DTOs, validation, centralized exception handling, and JPA specifications for dynamic ticket queries. Authentication combines short-lived JWT access tokens with rotating, server-managed refresh tokens. Authorization is enforced by the backend.

### Hybrid persistence

MySQL stores business data, relationships, and file metadata. MongoDB GridFS stores the binary file contents in three dedicated buckets:

| Functionality              | MySQL table                  | MongoDB GridFS bucket  |
| -------------------------- | ---------------------------- | ---------------------- |
| Ticket attachments         | `ticket_attachments`         | `ticket_files`         |
| Ticket comment attachments | `ticket_comment_attachments` | `ticket_comment_files` |
| User avatars               | `user_avatars`               | `user_avatars`         |

The metadata includes a reference to the corresponding GridFS file. Uploads include file-size and file-signature checks. Avatars support replacement and removal, with best-effort GridFS cleanup coordinated with MySQL transaction completion. These operations do not constitute a distributed transaction across the two databases.

## User Roles

| Role           | Main capabilities                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------------------- |
| **ADMIN**      | Manage all tickets, users, and configuration catalogs; access system-wide statistics.                       |
| **TECHNICIAN** | Work with assigned tickets, update their workflow, add internal comments, and access technician statistics. |
| **USER**       | Create and follow support requests, add public comments, and manage their own profile.                      |

Frontend role checks control navigation and available actions. The predefined roles can be viewed but not created or edited through the application.

## Getting Started with Docker

Docker is the recommended way to run the full application locally. There is no need to install Java, Node.js, MySQL, or MongoDB separately when using this approach.

### Requirements

- Docker Desktop (or Docker Engine with Docker Compose).
- Docker Compose 2.32 or later for Compose Watch.
- Available host ports: 3000 and 8080 for PROD; 3001 and 8081 for DEV.

Run the following commands from the root of the repository.

### Option 1 — Run the compiled application (recommended for demonstrations)

**1. Create the environment file.**

```powershell
# Windows PowerShell
Copy-Item .env.sample .env
```

```bash
# Linux / macOS
cp .env.sample .env
```

Configure `.env` with your own values:

```dotenv
MYSQL_ROOT_PASSWORD=replace_with_root_password
DB_USERNAME=helpdesk
DB_PASSWORD=replace_with_database_password
JWT_SECRET=replace_with_base64_signing_key
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_WEB_SERVER=localhost
NEXT_PUBLIC_WEB_PORT_BACK_END=8080
```

Replace the placeholders before starting. The JWT signing key must be a Base64-encoded random secret of at least 32 bytes (256 bits before Base64 encoding). For example, generate one with `openssl rand -base64 32` if OpenSSL is installed. In Windows PowerShell, the following is an alternative:

```powershell
$key = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($key)
[Convert]::ToBase64String($key)
$rng.Dispose()
```

**2. Build and start the application.**

```bash
docker compose config --quiet
docker compose up -d --build
```

Docker Compose builds the backend and frontend images, initializes MySQL with the SQL scripts on first startup, and starts MongoDB. The backend waits for the database healthchecks to pass.

**3. Open the application.**

- Frontend: <http://localhost:3000>
- REST API: `http://localhost:8080/api/v1`

On the first run, wait for image builds and application startup to finish. Use the demo accounts below to explore the interface.

### Option 2 — Development with live reload

Copy `.env.dev.sample` to `.env.dev` (using `Copy-Item` on Windows or `cp` on Linux/macOS). Edit the new file to use the following variables, with your own passwords and a valid Base64 JWT signing key:

```dotenv
DEV_MYSQL_ROOT_PASSWORD=replace_with_root_password
DEV_DB_USERNAME=helpdesk
DEV_DB_PASSWORD=replace_with_database_password
DEV_JWT_SECRET=replace_with_base64_signing_key
DEV_FRONTEND_URL=http://localhost:3001
DEV_NEXT_PUBLIC_WEB_SERVER=localhost
DEV_NEXT_PUBLIC_WEB_PORT_BACK_END=8081
```

```bash
docker compose --env-file .env.dev -f docker-compose.dev.yaml config --quiet
docker compose --env-file .env.dev -f docker-compose.dev.yaml up -d --build
```

In a separate terminal, enable automatic backend restart and recompilation when Java source files or the Maven configuration change:

```bash
docker compose --env-file .env.dev -f docker-compose.dev.yaml watch --no-up backend
```

The frontend reloads during development using Next.js, Webpack, and polling.

- Frontend: <http://localhost:3001>
- REST API: `http://localhost:8081/api/v1`

### Docker environments

| Resource         | DEV                       | PROD (local compiled build) |
| ---------------- | ------------------------- | --------------------------- |
| Compose file     | `docker-compose.dev.yaml` | `docker-compose.yaml`       |
| Environment file | `.env.dev`                | `.env`                      |
| Frontend         | `localhost:3001`          | `localhost:3000`            |
| Backend          | `localhost:8081`          | `localhost:8080`            |
| Source updates   | Live reload / restart     | Rebuild images              |
| Database volumes | Independent DEV volumes   | Independent PROD volumes    |

Both environments contain four services: frontend, backend, MySQL, and MongoDB. Named volumes preserve database data when containers are recreated. The production-mode application images use multi-stage builds and Next.js standalone output.

To inspect or stop the compiled environment:

```bash
docker compose ps
docker compose logs -f backend
docker compose stop
```

See [Docker Workflow](./DOCKER-WORKFLOW.md) for development commands, logs, rebuilds, and troubleshooting. Do not use `docker compose down -v` unless you intend to remove persistent volumes and their data.

### Demo accounts

The included seed data provides three public demo accounts for exploring the application roles.

| Username          | Password                  | Role       |
| ----------------- | ------------------------- | ---------- |
| `admin_demo`      | `admin_demo12345678`      | ADMIN      |
| `technician_demo` | `technician_demo12345678` | TECHNICIAN |
| `user_demo`       | `user_demo12345678`       | USER       |

Spring Boot enforces the account restrictions on the server.

- `admin_demo` can view all users and edit regular users and technicians. The `admin`, `admin_demo`, `technician_demo`, and `user_demo` accounts are read-only for `admin_demo` in the Users module. `admin_demo` cannot grant the `ADMIN` role.
- `technician_demo` and `user_demo` can use the features available to their respective roles.
- All three demo accounts have read-only personal details and cannot change their passwords. They can upload or replace their own avatar. Avatar deletion is disabled for these accounts.
- Visitors can sign in as `admin_demo` to create additional `USER` or `TECHNICIAN` test accounts and try the permitted user management operations.
- `admin` is the private administrator account.

Do not commit `.env`, `.env.dev`, or any real credentials. PROD in this repository means a **local production-mode build**, not a hardened public production deployment.

## Manual Setup (without Docker)

For development outside Docker, install Java 17, Node.js 22, npm, MySQL 8+, and MongoDB. Initialize MySQL using the four scripts in `database/`, configure `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `FRONTEND_URL`, and `MONGODB_URI` for the backend, and configure the frontend API connection.

See the [Database README](./database/README.md), [Backend README](./back-end/README.md), and [Frontend README](./front-end/README.md) for detailed setup. Start Spring Boot before starting the frontend:

```powershell
# In back-end/ on Windows
.\mvnw.cmd spring-boot:run
```

```bash
# In back-end/ on Linux / macOS
./mvnw spring-boot:run
```

```bash
# In front-end/
npm ci
npm run dev
```

## Testing and Quality Checks

The repository includes backend tests using JUnit and Mockito and frontend tests using Vitest and React Testing Library.

```powershell
# Backend — Windows, from back-end/
.\mvnw.cmd clean verify
```

```bash
# Backend — Linux / macOS, from back-end/
./mvnw clean verify
```

```bash
# Frontend, from front-end/
npm ci
npm run check
```

The frontend check runs linting, tests, and the production build. These checks complement, rather than replace, manual end-to-end testing with both databases running.

## Repository Structure

```text
IT-Service-Management/
├── back-end/                 # Spring Boot REST API and backend tests
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── README.md
├── front-end/                # Next.js application and frontend tests
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── README.md
├── database/                 # MySQL schema and demo data
│   ├── local/
│   │   └── 00_setup_local_database.sql
│   ├── 01_create_tables.sql
│   ├── 02_seed_reference_data.sql
│   ├── 03_seed_admin.sql      # Private local file prepared by the owner and ignored by Git
│   ├── 04_seed_demo_data.sql
│   └── README.md
├── docker-compose.yaml
├── docker-compose.dev.yaml
├── .env.sample
├── .env.dev.sample
├── DOCKER-WORKFLOW.md
├── GIT_WORKFLOW.md
├── LICENSE
└── README.md
```

- `local/00_setup_local_database.sql` creates and configures the local MySQL database for manual setup.
- `01_create_tables.sql` creates the tables and their relationships.
- `02_seed_reference_data.sql` loads the initial configuration, including roles, departments, categories, priorities, and statuses.
- `03_seed_admin.sql` creates the private administrator. The owner prepares this file locally after cloning, and `database/.gitignore` excludes it from Git.
- `04_seed_demo_data.sql` adds the demo accounts, sample tickets, comments, and ticket history.

The normal initialization order is `01`, `02`, `03`, and `04`. Docker runs only the SQL scripts directly under `database/` when MySQL first initializes an empty volume. MySQL skips initialization when it reuses an existing volume.

## Project Documentation

| Document                                | Contents                                                        |
| --------------------------------------- | --------------------------------------------------------------- |
| [Backend](./back-end/README.md)         | API architecture, security, configuration, endpoints, and tests |
| [Frontend](./front-end/README.md)       | UI architecture, environment setup, authentication, and tests   |
| [Database](./database/README.md)        | MySQL schema, initialization, and demo data                     |
| [Docker Workflow](./DOCKER-WORKFLOW.md) | Docker environments, commands, and development workflow         |
| [Git Workflow](./GIT_WORKFLOW.md)       | Branches, commits, pull requests, and collaboration guidelines  |

## License

Copyright © 2026 Diego González Sanz. All Rights Reserved.

This project is published for portfolio viewing and evaluation; it is **not open source**. Reuse, modification, and redistribution require prior written permission. See [LICENSE](./LICENSE) for the full terms.
