# Help Desk — IT Service Management

A full-stack **IT Service Management (ITSM)** application for managing IT support requests, tracking ticket activity, and organizing service desk operations.

Built with **Spring Boot**, **Next.js**, and **MySQL**, this project demonstrates end-to-end application development, JWT authentication, role-based access control, REST API design, and automated testing.

## Features

- **Authentication and sessions:** JWT access tokens, rotating refresh tokens, automatic session renewal, and logout.
- **Role-based access:** Different permissions and interfaces for `ADMIN`, `TECHNICIAN`, and `USER`.
- **Ticket management:** Create, update, assign, prioritize, and track support requests.
- **Ticket search:** Server-side pagination, sorting, and filters.
- **Comments and history:** Public/internal comments and a record of ticket changes.
- **Dashboard:** Role-specific statistics, recent tickets, and shortcuts.
- **Administration:** Manage users, departments, categories, priorities, and statuses; view configured roles.
- **User profiles:** Edit profile information and change passwords.
- **Internationalization:** English and Spanish interfaces.
- **Automated tests:** Backend and frontend tests, plus linting and build checks.

## Tech Stack

| Layer             | Technologies                                    |
| ----------------- | ----------------------------------------------- |
| Frontend          | Next.js 16, React 19, TypeScript                |
| UI                | Material UI, MUI X Data Grid                    |
| API client / i18n | Axios, next-intl                                |
| Backend           | Java 17, Spring Boot 4.1.1, Spring Security     |
| Authentication    | JWT, BCrypt, HttpOnly refresh-token cookies     |
| Database          | MySQL 8+, Spring Data JPA, Hibernate            |
| Testing           | JUnit 5, Mockito, Vitest, React Testing Library |
| Tooling           | Maven Wrapper, npm, ESLint, Git                 |

## User Roles

| Role           | Main capabilities                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------------------- |
| **ADMIN**      | Manage all tickets, users and configuration catalogs; access system-wide statistics.                        |
| **TECHNICIAN** | Work with assigned tickets, update their workflow, add internal comments, and access technician statistics. |
| **USER**       | Create and follow support requests, add public comments, and update their own profile.                      |

The backend enforces authorization. Frontend permissions control navigation and available actions. The predefined roles can be viewed but not created or edited through the application.

## Architecture

```text
             Next.js + React + TypeScript
                         |
                     Axios / HTTP
                         |
                  Spring Boot API
                     /api/v1
                         |
          Controllers -> Services -> Repositories
                         |
               Spring Data JPA / Hibernate
                         |
                       MySQL
```

The backend uses a layered architecture with DTOs, validation, centralized error handling, and specifications for dynamic ticket queries. Authentication combines short-lived JWT access tokens with rotating, server-managed refresh tokens.

## Repository Structure

```text
IT-Service-Management/
├── back-end/              # Spring Boot REST API and backend tests
│   └── README.md          # Backend setup, configuration, security and endpoints
├── front-end/             # Next.js application and frontend tests
│   └── README.md          # Frontend setup, environment and UI documentation
├── database/              # MySQL scripts and sample records
│   ├── 00_create_database.sql
│   ├── 01_create_tables.sql
│   ├── 02_seed_data.sql
│   └── README.md          # Database initialization guide
├── GIT_WORKFLOW.md
├── LICENSE
└── README.md              # Project overview (this file)
```

## Getting Started

### Requirements

- Java 17 or newer
- MySQL 8.0 or newer
- Node.js 22.22.2+ (or a version supported by the frontend dependencies) and npm

### 1. Set up the database

Create the `helpdesk` database and load its schema and sample data using the provided SQL scripts.

**Follow the [Database README](./database/README.md)** for the execution order, precautions, and verification queries.

### 2. Configure and run the backend

Set the database connection, JWT signing secret, and frontend origin as described in the backend guide. Then, from `back-end/`, start Spring Boot:

```powershell
# Windows (PowerShell)
.\mvnw.cmd spring-boot:run
```

```bash
# Linux / macOS
./mvnw spring-boot:run
```

By default, the API is available at `http://localhost:8080/api/v1`.

**Follow the [Backend README](./back-end/README.md)** for environment variables, security configuration, endpoints, and backend tests.

### 3. Configure and run the frontend

From `front-end/`, configure the backend connection using `.env.sample`, then install dependencies and start the development server:

```bash
npm ci
npm run dev
```

Open `http://localhost:3000` once the database and API are running.

**Follow the [Frontend README](./front-end/README.md)** for environment setup, available pages, authentication behavior, and frontend tests.

### Demo Accounts

The sample database includes these accounts. **The password for all seeded demo users is `123456`** (stored as a BCrypt hash).

| Username     | Password | Role       |
| ------------ | -------- | ---------- |
| `admin`      | `123456` | ADMIN      |
| `technician` | `123456` | TECHNICIAN |
| `user`       | `123456` | USER       |

Other sample accounts (`tech.sofia`, `tech.mario`, `user.pablo`, and `user.lucia`) use the same password.

> **Security:** These credentials are intended only for local development and demonstrations. Do not reuse them in production.

## Project Documentation

| Document                                     | Contents                                                                               |
| -------------------------------------------- | -------------------------------------------------------------------------------------- |
| **[Backend README](./back-end/README.md)**   | API architecture, authentication, authorization, configuration, endpoints and testing. |
| **[Frontend README](./front-end/README.md)** | Next.js structure, environment variables, pages, session handling and testing.         |
| **[Database README](./database/README.md)**  | SQL script order, schema initialization, seeded records and verification.              |
| **[Git Workflow](./GIT_WORKFLOW.md)**        | Branches, commits, pull requests and collaboration guidelines.                         |

## Future Improvements

- Ticket attachments (PDF files and images), with MongoDB planned as attachment storage.

*This feature is planned and is not part of v1.0.*

## License

Copyright © 2026 Diego González Sanz. All Rights Reserved.

This project is published for portfolio viewing and evaluation; it is **not open source**. Reuse, modification, and redistribution require prior written permission. See [LICENSE](./LICENSE) for the full terms.
