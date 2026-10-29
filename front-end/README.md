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