# Help Desk — Frontend

**English** | [Español](./README.es.md)

Frontend for a full-stack **IT Service Management (ITSM) / Help Desk** application. Built with Next.js and React, it provides role-based ticket management, administration screens, and a dashboard connected to the Spring Boot REST API.

## Tech Stack

Versions below are resolved in `package-lock.json`.

- **Next.js 16.4.2** (App Router), **React 19.3.0**, **TypeScript 5.9.3**
- **Material UI (MUI) 9.5.0** and **MUI X Data Grid 9.16.0**
- **Axios 1.20.0** for REST API communication
- **next-intl 4.14.9** for English and Spanish translations
- **Vitest 5.1.0**, **React Testing Library 16.3.3**, and **ESLint 9.39.5**

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
│   ├── styles/            # Shared styles and design tokens
│   ├── types/             # TypeScript interfaces and types
│   └── utils/             # Shared utilities
├── messages/
│   ├── en/                # English translations
│   └── es/                # Spanish translations
└── tests/                 # Service, component and Axios tests
```

Next.js uses `page.tsx` and `layout.tsx` under `src/app/` to define routes and shared UI. Route pages compose the appropriate layout and feature components. For example, the page at `src/app/tickets/[id]/page.tsx` passes the route ID to `TicketDetailsContent`. The corresponding module under `src/app/modules/tickets/` owns the screen, client interactions, and API calls.

The root layout wraps the application in `NextIntlClientProvider` and `AuthProvider`. `AppLayout` supplies the header and sidebar around feature content. Shared components, hooks, types, and utilities support the feature modules.

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

The production-mode image uses a multi-stage Node.js build and Next.js standalone output. Its runtime starts `node server.js` and includes `public/` and `.next/static/`. DEV runs `npm run dev -- --webpack` with polling enabled by Compose. Both environments get their API settings from Compose.

See [Docker Workflow](../DOCKER-WORKFLOW.md) for the development workflow and dependency update commands.

## Getting Started (without Docker)

Run these steps from `front-end/`.

**1. Install dependencies**

```bash
npm ci
```

**2. Configure environment variables**

Create `.env` from `.env.sample` in PowerShell or a Linux/macOS shell.

```powershell
# Windows PowerShell
Copy-Item .env.sample .env
```

```bash
# Linux / macOS
cp .env.sample .env
```

Set the [local API variables](#local-and-docker) in `.env`.

```dotenv
NEXT_PUBLIC_WEB_SERVER=localhost
NEXT_PUBLIC_WEB_PORT_BACK_END=8080
```

These settings use `http://localhost:8080/api/v1` as the API base URL. Leave `NEXT_PUBLIC_API_BASE_URL` unset for this local setup.

**3. Start the development server**

```bash
npm run dev
```

Open **http://localhost:3000**. Ensure the backend is running and its CORS configuration permits the frontend origin.

## Environment Variables

### Local and Docker

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_WEB_SERVER` | Backend hostname as seen by the browser. The local examples use `localhost`. |
| `NEXT_PUBLIC_WEB_PORT_BACK_END` | Published Spring Boot port. Use `8080` for manual setup and local PROD, or `8081` for Docker DEV. |

`src/config/env.ts` builds the base URL as `http://<host>:<port>/api/v1`. In Docker, the browser uses the published port on the host. PROD supplies both values as frontend build arguments from `.env`. DEV maps `DEV_NEXT_PUBLIC_WEB_SERVER` and `DEV_NEXT_PUBLIC_WEB_PORT_BACK_END` from `.env.dev` into the frontend container. Changes to public variables in a production build require rebuilding the frontend image.

### Cloud on Vercel

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Set to `/api/v1` so browser requests use the Vercel frontend origin. This value takes precedence over the local API variables. |
| `BACKEND_PROXY_URL` | Server-side Next.js setting for the Spring Boot origin on Render. |

When `BACKEND_PROXY_URL` is set, `next.config.ts` rewrites `/api/v1/:path*` to the same path on the Render backend. Keep `BACKEND_PROXY_URL` in the server environment without a `NEXT_PUBLIC_` prefix. Public variables are exposed to the browser and must contain only public values. See the [cloud architecture in the main README](../README.md#cloud-architecture).

## Authentication

`AuthProvider` exposes the current user, access token, authentication state, and sign-out action through `AuthContext`. Components read this state with `useAuth()`. The `isAuthReady` flag tells protected screens when restoration has finished.

1. **Sign in.** `LoginForm` calls `POST /api/v1/auth/login`. On success, `AuthProvider` stores the access token, user ID, username, and role in React state and `localStorage`, then the form redirects to `/dashboard`.
2. **Restore.** On mount, `AuthProvider` restores the session if all four `localStorage` keys are present (`token`, `userId`, `username`, and `role`), then sets `isAuthReady`. Protected feature screens wait for restoration and redirect users without a session to `/login`. Admin screens redirect other roles to `/403`.
3. **Send credentials.** The shared Axios instance adds `Authorization: Bearer <access-token>` to protected requests. It uses `withCredentials: true` so the browser can handle the rotating `HttpOnly` refresh cookie issued by Spring Boot.
4. **Refresh.** On an eligible `401`, the response interceptor calls `POST /api/v1/auth/refresh`. Concurrent failures share one in-flight promise in the current client instance. On success, `AuthProvider` saves the new access token and Axios retries each eligible request once. The refresh logic skips authentication endpoints and already retried failures. If refresh fails, the provider clears local authentication and redirects to `/login`.
5. **Sign out.** The header calls `signOut()`, which sends `POST /api/v1/auth/logout` so Spring Boot can revoke the refresh token and clear its cookie. The provider clears local authentication and redirects to `/login` even if the request fails.

## Roles and Demo Accounts

The sidebar and ticket screens adapt navigation and actions to the authenticated role. Spring Boot enforces authorization for each API request, including access to specific tickets and files.

| Role | Interface |
| --- | --- |
| `ADMIN` | Dashboard, tickets, profile, user and catalog administration, and the role catalog. |
| `TECHNICIAN` | Dashboard, assigned ticket list, profile, and ticket actions where permitted. |
| `USER` | Dashboard, tickets they created or that were requested for them, public comments, and profile. |

- `admin_demo` can manage unprotected `USER` and `TECHNICIAN` accounts. The Users interface makes `admin`, `admin_demo`, `technician_demo`, and `user_demo` read-only for `admin_demo` and prevents granting `ADMIN`.
- `technician_demo` and `user_demo` retain the ticket and dashboard features of their roles.
- All three demo accounts have read-only personal details and password changes disabled. Each can upload, replace, and delete their own avatar. See the [public demo accounts in the main README](../README.md#demo-accounts).

## Internationalization

`next.config.ts` registers `src/i18n/request.ts` with the `next-intl` plugin. The request config reads the `locale` cookie, accepts `en` or `es`, and defaults to `en`. `messages/index.ts` assembles the JSON files for each locale into namespaces such as `Auth`, `Navigation`, and `Tickets`. The root `NextIntlClientProvider` supplies these messages to client components.

The language selector writes the `locale` cookie for the whole site and calls `router.refresh()` so Next.js reads it on the next request. URLs stay the same when the language changes.

Client components use `useTranslations` with a namespace. This example uses the header's `Navigation.Header.logout` key.

```tsx
"use client";

import { useTranslations } from "next-intl";

export function LogoutLabel() {
  const t = useTranslations("Navigation.Header");
  return <span>{t("logout")}</span>;
}
```

To add a message, add the same key in the corresponding module JSON file under `messages/en/` and `messages/es/`. For a header label, use the `Header` object in each `navigation.json` file. Read the key in the component through the corresponding namespace.

To add a locale, create its module JSON files, register the locale and its namespaces in `messages/index.ts`, add it to `SUPPORTED_LOCALES` in `src/i18n/request.ts`, and extend `LanguageSelector` with an option and its label or flag. The root document currently declares `lang="en"` independently of language selection. The generic access-denied, not-found, and unexpected-error views use English text.

## Files and Avatars

File operations use dedicated Axios services in the feature modules.

| Service | Operations | Accepted formats | Maximum per file |
| --- | --- | --- | --- |
| `ticketAttachmentService.ts` | List, upload, preview, and download ticket attachments. | PDF, JPEG, PNG | 10 MiB |
| `ticketCommentAttachmentService.ts` | List, upload, preview, and download comment attachments. | PDF, JPEG, PNG | 10 MiB |
| `userAvatarService.ts` | Read an avatar by user ID, and upload, replace, or delete the current user's avatar. | JPEG, PNG | 5 MiB |

Uploads send the file in a `FormData` field named `file`. Comment attachments are selected while writing a comment and uploaded after the comment is created. Previews and downloads use `Blob` responses and object URLs. The backend enforces permissions and file validation.

After an avatar is uploaded, replaced, or deleted, the profile refreshes its image and dispatches `user-avatar-updated` so the header does the same. An avatar read that returns `204 No Content` displays the default avatar. Both views update without reloading the page, including for the three demo accounts.

## Main Pages

| Route                    | Description                              |
| ------------------------ | ---------------------------------------- |
| `/`                     | Redirect to `/login`                     |
| `/login`                 | User authentication                      |
| `/dashboard`             | Statistics and recent tickets            |
| `/tickets`               | Ticket listing, filtering and management |
| `/tickets/[id]`          | Ticket details, actions and attachments  |
| `/tickets/[id]/comments` | Ticket conversation                      |
| `/tickets/[id]/history`  | Ticket activity history                  |
| `/profile`               | Profile and password management          |
| `/users`                 | User administration                      |
| `/departments`           | Department administration                |
| `/categories`            | Category administration                  |
| `/priorities`            | Priority administration                  |
| `/statuses`              | Status administration                    |
| `/roles`                 | Role information                         |
| `/403`                  | Access denied                            |

Users, departments, categories, priorities, statuses, and roles are admin pages. The ticket routes share a layout that waits for authentication and checks the ticket ID. The feature screens handle access errors from the API. `src/app/not-found.tsx` and `src/app/error.tsx` provide the not-found and unexpected-error views.

## Tests and Quality Checks

Run these commands from `front-end/` with dependencies installed and the API environment configured.

```bash
npm run lint       # ESLint
npm run test:run   # Run Vitest once
npm run build      # Production build
npm run check      # Lint, tests and build
```

`npm run lint` applies the configured ESLint rules, `npm run test:run` runs Vitest once, and `npm run build` generates the production build. `npm run check` runs those three commands in order and stops if any of them fails. Use `npm test` for Vitest watch mode in an interactive terminal.

`vitest.config.mts` uses `jsdom` for the test environment. React Testing Library exercises rendered components, and the setup file clears the rendered DOM after each test.

- `tests/services/` checks API calls and parameters for authentication, tickets, comments, history, users, and catalogs with mocked Axios calls.
- `tests/components/` covers sign-in, ticket and user forms, filters, ticket dialogs, comment attachments, and profile behavior. Demo cases cover the restricted `ADMIN` role option, the read-only password form, and avatar upload and deletion in the profile and header.
- `tests/axios/` covers Bearer headers, refresh cookies, a shared refresh for concurrent `401` responses, retries, and session expiration.

The automated tests use simulated services and responses. Verify full login, role restrictions, ticket operations, and file workflows against a running Spring Boot backend. To run the compiled frontend locally, use the standalone Docker setup above, which serves the generated `server.js` and bundled static files.
