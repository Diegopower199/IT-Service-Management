# Docker Workflow — IT Service Management

**English** | [Español](./DOCKER-WORKFLOW.es.md)

A guide to building, running, and managing the Help Desk project with Docker.

## 1. Project environments

| Resource | DEV (development) | Local PROD (compiled build) |
| --- | --- | --- |
| Project | `helpdesk-dev` | `helpdesk-prod` |
| Docker Compose | `docker-compose.dev.yaml` | `docker-compose.yaml` |
| Variables | `.env.dev` | `.env` |
| Dockerfiles | `Dockerfile.dev` | `Dockerfile` |
| Backend image | `helpdesk-backend:dev` | `helpdesk-backend:prod` |
| Frontend image | `helpdesk-frontend:dev` | `helpdesk-frontend:prod` |
| Frontend | <http://localhost:3001> | <http://localhost:3000> |
| API | `http://localhost:8081/api/v1` | `http://localhost:8080/api/v1` |
| Default network | `helpdesk-dev_default` | `helpdesk-prod_default` |

Both environments include the Next.js frontend (`frontend`), the Spring Boot backend (`backend`), MySQL (`mysql`, image `mysql:8.4`), and MongoDB (`mongodb`, image `mongo:8.0`). Each project has its own network and volumes. Only the frontend and backend publish ports to the host.

DEV mounts the source code of both applications. Local PROD runs the Spring Boot JAR and the Next.js standalone build from images built on your machine. The cloud deployment uses Render and Vercel. [Cloud architecture](./README.md#cloud-architecture)

- A **Dockerfile** defines how to build an image.
- **Docker Compose** defines how to create, configure, and connect containers.
- An **image** packages the application. A container is an instance of that image.
- A **volume** stores data that must persist even when containers are removed.

## 2. Create and start the environments

Start Docker Desktop or Docker Engine with the Docker Compose plugin. DEV requires Docker Compose 2.32.0 or later for the Watch `restart` action. Run `docker compose version` to check the version and make sure the ports for your chosen environment are free.

For a new setup, prepare `.env` from `.env.sample` or `.env.dev` from `.env.dev.sample`. Use the file for the environment you intend to start and replace the example credentials. [Environment files](./README.md#environment-files)

| Local PROD | DEV | Purpose |
| --- | --- | --- |
| `MYSQL_ROOT_PASSWORD` | `DEV_MYSQL_ROOT_PASSWORD` | Password for the MySQL root account. |
| `DB_USERNAME` | `DEV_DB_USERNAME` | MySQL account used by Spring Boot. The sample value is `helpdesk`. |
| `DB_PASSWORD` | `DEV_DB_PASSWORD` | Password for the application's MySQL account. |
| `JWT_SECRET` | `DEV_JWT_SECRET` | Base64-encoded JWT signing key. |
| `FRONTEND_URL` | `DEV_FRONTEND_URL` | Origin allowed by the backend. Use `http://localhost:3000` in local PROD and `http://localhost:3001` in DEV. |
| `NEXT_PUBLIC_WEB_SERVER` | `DEV_NEXT_PUBLIC_WEB_SERVER` | API hostname as seen by the browser. Use `localhost` in both environments. |
| `NEXT_PUBLIC_WEB_PORT_BACK_END` | `DEV_NEXT_PUBLIC_WEB_PORT_BACK_END` | Published API port. Use `8080` in local PROD and `8081` in DEV. |

Run the commands in this guide from the repository root unless another directory is specified.

### DEV — development

```bash
docker compose --env-file .env.dev -f docker-compose.dev.yaml config --quiet
docker compose --env-file .env.dev -f docker-compose.dev.yaml up -d --build
```

Open <http://localhost:3001> and [start Watch](#start-developing) to work on the backend.

### Local PROD — validate a compiled build

```bash
docker compose config --quiet
docker compose up -d --build
```

Open <http://localhost:3000>. Compose uses `docker-compose.yaml` and `.env` by default.

### What `up -d --build` does

1. Reads the Compose configuration and the variables for the selected environment.
2. Builds the frontend and backend images, reusing the cache where applicable. It pulls the official images if needed.
3. Creates missing resources and recreates containers when their configuration or image changes. It mounts the existing volumes again.
4. Starts the services in the background. The backend waits for MySQL and MongoDB to pass their health checks. MySQL runs the SQL scripts when initializing an empty volume.

## 3. Main commands

### Docker — inspect resources

| Command | Purpose |
| --- | --- |
| `docker images` | List images and tags. |
| `docker ps` | List running containers and their published ports. |
| `docker ps -a` | List all containers, including stopped ones. |
| `docker volume ls` | List volumes. |
| `docker network ls` | List networks. |
| `docker compose ls` | List running Compose projects. |

### Docker — build an image manually

Compose can build both application images in one operation. To build just the backend images without Compose, run these commands from `back-end/`.

```bash
docker build -t helpdesk-backend:prod .
docker build -f Dockerfile.dev -t helpdesk-backend:dev .
```

`-t` sets the name and tag, `-f` selects the Dockerfile, and `.` uses the current directory as the build context. These commands produce images only.

### Docker Compose — manage services

Prefix the operations in the table with `docker compose --env-file .env.dev -f docker-compose.dev.yaml` in DEV, or `docker compose` in local PROD.

| Operation | Purpose |
| --- | --- |
| `config --quiet` | Validate the Compose configuration without printing the resolved values. |
| `build` | Build images without creating or starting containers. |
| `up -d` | Create and start the required containers. It reuses containers that are still current and recreates those with configuration or image changes. |
| `up -d --build` | Build images, then create, recreate, or start containers as needed. |
| `start` | Start existing stopped containers with their current configuration. |
| `stop` | Stop containers and keep their volumes. |
| `restart backend` | Restart the backend container with its current image and configuration. |
| `down` | Stop and remove containers and the project's default network. It keeps images and named volumes. |
| `ps` / `ps -a` | Show the project's containers. `-a` includes stopped containers. |
| `logs --tail=100 backend` | Show the last 100 lines of backend logs. |
| `logs -f frontend` | Follow frontend logs in real time. |
| `watch --no-up backend` | Watch for backend changes with the services already running. |

| Option | Purpose |
| --- | --- |
| `--env-file .env.dev` | Select the development environment file. |
| `-f docker-compose.dev.yaml` | Select the development Compose file. |
| `-d` | Run services in the background. |
| `--build` | Build images before starting the services. |
| `--no-deps` | Start or update the specified service without starting its dependencies. |
| `--force-recreate` | Force recreation of selected containers with `up`. |

Recreating a container replaces it with one that uses the current configuration. Use `up -d` to apply configuration changes. Add `--build` if the change affects the contents of the image.

## 4. Daily workflow

### Start developing

If you have already built the DEV images, start the services.

```bash
docker compose --env-file .env.dev -f docker-compose.dev.yaml up -d
```

In another terminal, start Watch and keep it open while developing.

```bash
docker compose --env-file .env.dev -f docker-compose.dev.yaml watch --no-up backend
```

- Spring Boot runs with `mvn spring-boot:run`. Watch restarts the container when it detects changes to `back-end/src` or `back-end/pom.xml`. Maven compiles the code and resolves dependencies on startup.
- Edit React or TypeScript code in `front-end/` and check the changes at <http://localhost:3001>. Next.js runs with `npm run dev -- --webpack`, and Compose enables file polling with `WATCHPACK_POLLING`. Ordinary source changes take effect without rebuilding the image.

### Check status and logs

```bash
docker compose --env-file .env.dev -f docker-compose.dev.yaml ps -a
docker compose --env-file .env.dev -f docker-compose.dev.yaml logs --tail=100 backend mysql mongodb
docker compose --env-file .env.dev -f docker-compose.dev.yaml logs -f frontend
```

For local PROD, use the equivalent commands.

```bash
docker compose ps -a
docker compose logs --tail=100 backend mysql mongodb
docker compose logs -f frontend
```

### Update local PROD with the latest changes

```bash
docker compose up -d --build
```

To update just one service when its dependencies are already running, use the corresponding command.

```bash
docker compose up -d --build --no-deps backend
docker compose up -d --build --no-deps frontend
```

### Finish working

Press `Ctrl+C` in the Watch terminal. Stop the environment you used to keep its containers and data.

```bash
docker compose --env-file .env.dev -f docker-compose.dev.yaml stop
docker compose stop
```

Use `down` in place of `stop` to remove the environment's containers and network while keeping its named volumes.

## 5. When to rebuild an image

| Change | DEV | Local PROD |
| --- | --- | --- |
| Java code | Save with Watch running. If Watch is stopped, restart `backend`. | Rebuild `backend`. |
| React or TypeScript code | Save and check for a reload in the browser. | Rebuild `frontend`. |
| Maven dependencies (`back-end/pom.xml`) | Watch restarts `backend`, and Maven resolves the changes with its cache. | Rebuild `backend`. |
| npm dependencies (`front-end/package.json` or `front-end/package-lock.json`) | Update the `node_modules` volume using the procedure below. | Rebuild `frontend`. |
| Dockerfiles | Rebuild the affected service with `up -d --build`. | Rebuild the affected service with `up -d --build`. |
| Docker Compose | Validate with `config --quiet` and apply changes with `up -d`. Add `--build` if the build instructions or arguments change. | Validate with `config --quiet` and apply changes with `up -d`. Add `--build` if the build instructions or arguments change. |
| Backend variables | Apply the values from `.env.dev` with `up -d backend`. | Apply the values from `.env` with `up -d backend`. |
| Public `NEXT_PUBLIC_*` variables | Apply the values from `.env.dev` with `up -d frontend`. Compose supplies the DEV variables to Next.js when it creates the container. | Rebuild `frontend`. The Dockerfile incorporates `NEXT_PUBLIC_WEB_SERVER` and `NEXT_PUBLIC_WEB_PORT_BACK_END` during the build. |
| SQL scripts | Apply the change explicitly if the MySQL volume is already initialized. | Apply the change explicitly if the MySQL volume is already initialized. |
| Next.js configuration (`front-end/next.config.ts`) | Restart `frontend` if the development server has yet to load the mounted configuration. | Rebuild `frontend`. |

DEV mounts `back-end/` and `front-end/` at `/app` inside their containers. Other volumes keep caches, build output, and dependencies at their respective container paths.

| DEV volume | Container path | Contents |
| --- | --- | --- |
| `helpdesk-dev_backend_target` | `/app/target` | Maven build output. |
| `helpdesk-dev_maven_cache` | `/root/.m2` | Local Maven repository and cache. |
| `helpdesk-dev_frontend_node_modules` | `/app/node_modules` | Installed npm dependencies. |
| `helpdesk-dev_frontend_next` | `/app/.next` | Next.js development output and cache. |

The existing `node_modules` volume survives a rebuild or recreation of `frontend`. When npm dependencies change in DEV, run `npm ci` in a temporary container that mounts the same volume. Then start the service with the updated image.

```bash
docker compose --env-file .env.dev -f docker-compose.dev.yaml stop frontend
docker compose --env-file .env.dev -f docker-compose.dev.yaml run --rm --no-deps frontend npm ci
docker compose --env-file .env.dev -f docker-compose.dev.yaml up -d --build frontend
```

## 6. Database initialization and persistence

Both projects mount `database/` read-only at `/docker-entrypoint-initdb.d`. On first initialization of an empty MySQL volume, the image creates `helpdesk` and the application's database account from its environment variables. It then runs the SQL scripts at the root of `database/` in filename order.

1. `01_create_tables.sql` creates the tables and relationships.
2. `02_seed_reference_data.sql` loads the initial catalogs.
3. `03_seed_admin.sql` creates the private administrator if the owner has prepared the local file.
4. `04_seed_demo_data.sql` loads the public demo accounts, sample tickets, comments, and history.

Git ignores `03_seed_admin.sql`, and the owner prepares it locally. A fresh clone can use the [public demo accounts](./README.md#demo-accounts). Run `database/local/00_setup_local_database.sql` manually for installations outside Docker.

Reusing an initialized MySQL volume skips the scripts. Editing or adding a script does not update that volume. Apply any necessary changes explicitly to the existing schema or data.

| Data | DEV volume | Local PROD volume |
| --- | --- | --- |
| MySQL | `helpdesk-dev_mysql_data` | `helpdesk-prod_mysql_data` |
| MongoDB | `helpdesk-dev_mongo_data` | `helpdesk-prod_mongo_data` |

MySQL stores users, catalogs, tickets, comments, history, refresh token hashes, and file metadata. MongoDB stores the binary contents of attachments and avatars using GridFS. Stopping or recreating the services preserves this data in the existing volumes. Separate volumes allow development in DEV and validation in local PROD with independent data.

> **Warning.** `docker compose down -v` can remove the named volumes and persistent data of the selected project. For routine shutdown, use `stop` or `down` without `-v`.

Volumes provide persistence. Keep separate backups and coordinate MySQL and MongoDB restores to preserve both the SQL references and the file contents. [Database documentation](./database/README.md)

## 7. Troubleshooting

Start by [checking the environment's status and logs](#check-status-and-logs). Review the output locally and redact sensitive values before sharing it.

| Problem | Check and resolution |
| --- | --- |
| Docker Desktop is closed or Docker Engine is unresponsive | Run `docker info`. If the client cannot reach the server, start Docker Desktop or Docker Engine and wait for it to become available. |
| Port `3000`, `3001`, `8080`, or `8081` is in use | Run `docker ps` to check the published ports of running containers. If another process owns the port, identify it with your system tools and free the port for the environment you intend to use. |
| Environment variables are missing | Run `config --quiet` with the correct environment file and check the warnings. Compare the required names and values with the matching sample. Terminal variables can override the environment file. |
| Spring Boot cannot connect to MySQL | Check the status of `mysql` and the logs for `backend` and `mysql`. The backend uses `jdbc:mysql://mysql:3306/helpdesk`. Check that the application account and its permissions match the active volume. |
| Spring Boot cannot connect to MongoDB | Check the status and logs of `mongodb`. The backend uses `mongodb://mongodb:27017/helpdesk_attachments`. Docker uses service names for connections between containers. |
| A database fails its health check | Check `ps -a` and the logs of the affected database. MySQL runs `SELECT 1` with the application account, and MongoDB runs a ping. Wait for initialization to finish or resolve the error shown in the logs. The backend depends on both checks passing. |
| Java changes do not appear | Check that you are using DEV, that Watch is running, and that the edited file is under `back-end/src` or is `back-end/pom.xml`. Look for the restart and any compilation errors in the logs. In local PROD, rebuild `backend`. |
| Frontend changes do not appear | Check that you opened the correct environment's port. In DEV, inspect the `frontend` logs for Webpack compilation or dependency errors. If the npm lockfile changed, follow the DEV dependency procedure. In local PROD, rebuild `frontend`. |
| Edited SQL scripts do not run again | Check whether MySQL is reusing a volume. Apply the necessary change explicitly to the existing schema or data. |
| The MySQL password does not change after editing `.env` or `.env.dev` | Initialization values apply when the database is created in an empty volume. Use the credentials already stored in the volume or rotate the password in a MySQL administrative session. Then coordinate the change in the environment file and recreate the affected services with `up -d`. |

## 8. Security and reminders

- Keep `.env` and `.env.dev` out of Git. They contain database passwords and JWT signing keys. Share the templates to describe the configuration.
- Generate a separate JWT key for each environment from at least 32 cryptographically random bytes and encode it in Base64. Spring Boot uses it to sign and verify tokens. [JWT signing key](./README.md#jwt-signing-key)
- Keep the application administrator `admin`, its password, and `03_seed_admin.sql` private. Use a MySQL account with the permissions the backend needs and reserve the MySQL root account for administration.
- Use test data only in the public demo. The Compose files are intended for local use. Render and Vercel are configured separately with the cloud deployment's data services and secrets.
- DEV and local PROD can run at the same time on their respective ports. Use separate browser profiles if you need to keep the `localhost` sessions separate.
