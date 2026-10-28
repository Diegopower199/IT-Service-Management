## Environment Variables

The backend uses environment variables to store sensitive configuration values. Secrets must not be hardcoded in the source code or committed to the repository.

### JWT Secret

The JWT signing key is configured in `application.properties` as follows:

```properties
jwt.secret=${JWT_SECRET}
```

Before starting the backend, the `JWT_SECRET` environment variable must be defined.

#### Generate a JWT secret on Windows PowerShell

```powershell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

The last command generates a random Base64-encoded 256-bit key suitable for HS256.

Do not share or commit the generated key.

#### Set the environment variable

In the same PowerShell terminal that will be used to start the backend:

```powershell
$env:JWT_SECRET="YOUR_GENERATED_SECRET"
```

You can verify that the variable exists with:

```powershell
$env:JWT_SECRET
```

Then start the application:

```powershell
.\mvnw.cmd spring-boot:run
```

> **Note:** `$env:JWT_SECRET` configured this way exists only for the current PowerShell session. If the terminal is closed, the variable must be configured again before starting the backend.

### Security

Never commit real secrets, passwords, JWT signing keys, database credentials, or production configuration values to Git.

For production environments, sensitive values should be provided through environment variables or an appropriate secrets management system.