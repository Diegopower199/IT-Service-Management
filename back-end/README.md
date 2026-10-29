## Backend environment variables

Before starting the Spring Boot backend, configure the required environment variables.

### Required variables

| Variable       | Description                                               |
| -------------- | --------------------------------------------------------- |
| `DB_URL`       | MySQL connection URL                                      |
| `DB_USERNAME`  | MySQL username                                            |
| `DB_PASSWORD`  | MySQL password                                            |
| `JWT_SECRET`   | Secret used to sign JWT access tokens                     |
| `FRONTEND_URL` | Frontend origin allowed by the backend CORS configuration |

### Optional variables

| Variable                              | Default value | Description                                          |
| ------------------------------------- | ------------- | ---------------------------------------------------- |
| `SERVER_PORT`                         | `8080`        | Spring Boot server port                              |
| `JWT_ACCESS_TOKEN_EXPIRATION_MINUTES` | `15`          | Access token expiration time                         |
| `JWT_REFRESH_TOKEN_EXPIRATION_DAYS`   | `7`           | Refresh token expiration time                        |
| `COOKIE_SECURE`                       | `false`       | Set to true when running the application over HTTPS. |

### Windows PowerShell

```powershell
setx DB_URL "jdbc:mysql://127.0.0.1:3306/helpdesk"
setx DB_USERNAME "root"
setx DB_PASSWORD "your_database_password"
setx JWT_SECRET "your_jwt_secret"
setx FRONTEND_URL "http://localhost:3000"
```

After setting the variables, restart the terminal or IDE before starting the backend.

Do not commit real passwords, JWT secrets, API keys, or other credentials to the repository.

## Run the backend

1. Configure the required environment variables.
2. Make sure MySQL is running and the configured database exists.
3. Start the Spring Boot application:

```powershell
.\mvnw clean spring-boot:run

If you experience build issues, you can manually remove the generated `target` directory before restarting the backend:

```powershell
Remove-Item -Recurse -Force .\target
.\mvnw clean spring-boot:run