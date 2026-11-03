## Frontend environment variables

Before starting the Next.js frontend, configure the required environment variables.

### Required variables

| Variable                        | Description                          |
| ------------------------------- | ------------------------------------ |
| `NEXT_PUBLIC_WEB_SERVER`        | Hostname of the Spring Boot backend  |
| `NEXT_PUBLIC_WEB_PORT_BACK_END` | Port used by the Spring Boot backend |

### Local configuration

Create a `.env` file inside the frontend directory using `.env.sample` as a template:

```env
NEXT_PUBLIC_WEB_SERVER=localhost
NEXT_PUBLIC_WEB_PORT_BACK_END=8080
```

The frontend uses these variables to build the backend API URL:

```text
http://localhost:8080/api/v1
```

The `.env` file is ignored by Git and should not be committed.

The `.env.sample` file is included in the repository as a configuration template.

Do not store passwords, tokens, API keys, or other secrets in `NEXT_PUBLIC_*` variables, because these values are exposed to the browser.

---

## Running the application

Start the Next.js development server:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000
```

Make sure the Spring Boot backend is running and that the values configured in `.env` match the backend host and port.

---

## Development validation workflow

Before considering a frontend change complete, the project should pass a basic validation workflow to ensure code quality, test stability, and production compatibility.

### Run the application locally

During development, use:

```bash
npm run dev
```

Verify manually that the functionality affected by the change works correctly.

This is especially useful for checking:

- UI behaviour
- MUI components and dialogs
- Forms
- Navigation
- Role-based views
- API integrations
- Responsive layout
- Visual regressions

### Run ESLint

Check the project for linting and code quality issues:

```bash
npm run lint
```

The command should finish without errors before committing changes.

### Run automated tests

Run the complete frontend test suite:

```bash
npm run test:run
```

All tests should pass before considering the change stable.

During development, tests can also be executed in watch mode:

```bash
npm test
```

Vitest will remain active and rerun affected tests when files change.

### Create a production build

Verify that the application can compile successfully for production:

```bash
npm run build
```

A successful build confirms, among other things, that:

- Next.js can compile the application
- TypeScript checks pass
- Application routes can be processed correctly
- Production optimization completes successfully
- No build-time errors have been introduced

A successful build will include output similar to:

```text
✓ Compiled successfully
✓ Finished TypeScript
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

---

## Recommended workflow before a commit

The recommended validation process is:

```text
Implement change
      ↓
Run and test locally
      ↓
npm run lint
      ↓
npm run test:run
      ↓
npm run build
      ↓
Commit changes
```

A change should ideally meet all of the following conditions before being committed:

```text
Manual verification     ✅
ESLint                  ✅
Automated tests         ✅
Production build        ✅
```

---

## Validation command

The following script can be added to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest",
    "test:run": "vitest run",
    "check": "npm run lint && npm run test:run && npm run build"
  }
}
```

This allows the complete automated validation workflow to be executed with a single command:

```bash
npm run check
```

The command runs:

```text
ESLint
  ↓
Automated tests
  ↓
Production build
```

If `npm run check` completes successfully, the frontend has passed the main automated validation checks.

It is recommended to run this command before creating a commit or opening a pull request.