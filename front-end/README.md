# Help Desk — Frontend

Frontend for a full-stack **IT Service Management (ITSM) / Help Desk** application. Built with Next.js and React, it provides role-based ticket management, administration screens, and a dashboard connected to the Spring Boot REST API.

## Tech Stack

- **Next.js 16** (App Router), **React 19**, **TypeScript**
- **Material UI (MUI)** and **MUI X Data Grid**
- **Axios** for REST API communication
- **next-intl** for English and Spanish translations
- **Vitest**, **React Testing Library**, and **ESLint**

## Features

- Login, logout, session management, and automatic JWT access-token renewal.
- Role-aware navigation for **ADMIN**, **TECHNICIAN**, and **USER**.
- Ticket creation, editing, assignment, priority changes, and status transitions.
- Ticket listings with server-side pagination, sorting, and filters.
- Ticket details, public/internal comments, and change history.
- Upload, preview, and download ticket and comment attachments (PDF, JPEG, PNG; up to 10 MiB per file).
- User avatar upload, replacement, and removal (JPEG, PNG; up to 5 MiB), synchronized between profile and header.
- Dashboard statistics and recent tickets.
- Administration of users, departments, categories, priorities, and statuses.
- Profile editing and password changes.
- English and Spanish interface with language selection.

## Project Structure

```text
front-end/
├── src/
│   ├── app/
│   │   ├── modules/       # Feature components and API services
│   │   ├── dashboard/     # Dashboard page
│   │   ├── tickets/       # Tickets, comments and history pages
│   │   ├── users/         # User administration
│   │   ├── profile/       # User profile
│   │   └── .../           # Login, catalogues and error pages
│   ├── components/ui/     # Reusable UI elements
│   ├── config/            # Axios and API configuration
│   ├── context/           # Authentication state
│   ├── hooks/             # Shared hooks
│   ├── i18n/              # Locale configuration
│   ├── layouts/           # Application layout and navigation
│   ├── types/             # TypeScript interfaces and types
│   └── utils/             # Shared utilities
├── messages/
│   ├── en/                # English translations
│   └── es/                # Spanish translations
└── tests/                 # Service, component and Axios tests
```

## Requirements

- **Node.js 22.22.2+** (or another version supported by the installed dependencies)
- **npm**
- A running Spring Boot backend connected to the initialized MySQL database and MongoDB GridFS

For backend and database setup, see the [Backend README](../back-end/README.md) and [Database README](../database/README.md).

## Run with Docker

Docker Compose starts the frontend together with Spring Boot, MySQL, and MongoDB. Follow the [main README](../README.md) to configure `.env` or `.env.dev` at the repository root.

Run these commands from the root:

```bash
# Compiled environment
docker compose up -d --build

# Live development
docker compose --env-file .env.dev -f docker-compose.dev.yaml up -d --build
```

|                | DEV                             | PROD (local compiled build)    |
| -------------- | ------------------------------- | ------------------------------ |
| Frontend URL   | `http://localhost:3001`         | `http://localhost:3000`        |
| Backend API    | `http://localhost:8081/api/v1`  | `http://localhost:8080/api/v1` |
| Dockerfile     | `Dockerfile.dev`                | `Dockerfile`                   |
| Source updates | Bind mount, Webpack and polling | Rebuild image                  |

The production-mode image uses a multi-stage Node.js build and Next.js standalone output. `NEXT_PUBLIC_*` values are embedded at build time; rebuild the production frontend if they change. In Docker development the Compose configuration supplies the environment variables, so a separate frontend `.env` is not required. Use the host address and published backend port for browser requests, not the internal Docker service name.

See [Docker Workflow](../DOCKER-WORKFLOW.md) for the development workflow and dependency update commands.

## Getting Started (without Docker)

From the `front-end/` directory:

**1. Install dependencies**

```bash
npm ci
```

**2. Configure environment variables**

Create `.env` from the included `.env.sample` file:

```powershell
# Windows PowerShell
Copy-Item .env.sample .env
```

```bash
# Linux / macOS
cp .env.sample .env
```

Set the Spring Boot backend host and port:

```dotenv
NEXT_PUBLIC_WEB_SERVER=localhost
NEXT_PUBLIC_WEB_PORT_BACK_END=8080
```

The frontend constructs the API base URL as `http://localhost:8080/api/v1` with these values. Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser; **never put secrets in them**.

**3. Start the development server**

```bash
npm run dev
```

Open **http://localhost:3000**. Ensure the backend is running and its CORS configuration permits the frontend origin.

## Authentication

Users sign in through `POST /api/v1/auth/login`. The application sends the JWT access token in the `Authorization: Bearer` header on protected API requests.

The backend issues a rotating refresh token in an **HttpOnly cookie**. Axios handles access-token expiration by requesting a new token and retrying the original request. The current frontend stores its access token and basic user session information in `localStorage`.

Role-based UI checks improve navigation and the user experience; **all authorization is enforced by the backend**.

## Files and Avatars

File operations use dedicated Axios services in the feature modules:

| Service                             | Responsibility                                                                                     |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| `ticketAttachmentService.ts`        | List, upload, preview, and download ticket attachments                                             |
| `ticketCommentAttachmentService.ts` | List, upload, preview, and download comment attachments                                            |
| `userAvatarService.ts`              | Retrieve, upload, replace, and remove the current user's avatar (image reads can target a user ID) |

Uploads use `FormData`; image and document downloads use binary responses (`Blob`). Comment attachments are selected when creating a comment. Existing attachments can be previewed and downloaded, but not removed through the interface. Avatar changes update the header as well as the profile view. The interface handles the no-avatar response (`204 No Content`) with a fallback avatar.

File validation in the UI improves usability; the backend remains responsible for enforcing permissions and validation.

## Main Pages

| Route                    | Description                              |
| ------------------------ | ---------------------------------------- |
| `/login`                 | User authentication                      |
| `/dashboard`             | Statistics and recent tickets            |
| `/tickets`               | Ticket listing, filtering and management |
| `/tickets/[id]/comments` | Ticket conversation                      |
| `/tickets/[id]/history`  | Ticket activity history                  |
| `/profile`               | Profile and password management          |
| `/users`                 | User administration                      |
| `/departments`           | Department administration                |
| `/categories`            | Category administration                  |
| `/priorities`            | Priority administration                  |
| `/statuses`              | Status administration                    |
| `/roles`                 | Role information                         |

Administrative pages are intended for the **ADMIN** role. The application also includes `403`, `404`, and unexpected-error pages.

## Tests and Quality Checks

Run from `front-end/`:

```bash
npm run lint       # ESLint
npm run test:run   # Run Vitest once
npm run build      # Production build
npm run check      # Lint, tests and build
```

For interactive test development, use `npm test` (Vitest watch mode).

To run the production build locally:

```bash
npm run build
npm run start
```

The automated suite covers API services, Axios authentication behavior, and selected forms, dialogs, and ticket-management components. Run manual end-to-end checks with the backend to verify the complete workflow.
