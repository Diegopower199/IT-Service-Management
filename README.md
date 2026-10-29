## Authentication and Token Refresh

The application uses a stateless authentication architecture based on JWT access tokens and server-managed refresh tokens.

### Authentication Flow

After a successful login:

1. The backend generates a short-lived JWT access token.
2. The access token is returned in the response body.
3. A long-lived refresh token is generated using a cryptographically secure random value.
4. Only the SHA-256 hash of the refresh token is stored in the database.
5. The original refresh token is sent to the browser using an HttpOnly cookie.

The frontend stores the access token in `localStorage`, while the refresh token remains inaccessible to JavaScript.

```text
POST /auth/login
        │
        ├── Access Token ──→ Response body ──→ localStorage
        │
        └── Refresh Token ─→ HttpOnly cookie
```

### Access Token

Access tokens are JWTs used to authenticate protected API requests.

Axios automatically adds the token to protected requests using the Bearer authentication scheme:

```http
Authorization: Bearer <access-token>
```

Access tokens are intentionally short-lived. Their lifetime is configurable through:

```properties
jwt.access-token-expiration-minutes=${JWT_ACCESS_TOKEN_EXPIRATION_MINUTES:15}
```

### Refresh Token

Refresh tokens are used to obtain new access tokens without requiring the user to log in again.

The browser stores the refresh token in an HttpOnly cookie, meaning it cannot be accessed directly from JavaScript.

Refresh tokens are stored server-side using only their SHA-256 hashes.

Each stored refresh token contains:

- Associated user.
- Creation timestamp.
- Expiration timestamp.
- Revocation status.

The refresh token lifetime is configurable through:

```properties
jwt.refresh-token-expiration-days=${JWT_REFRESH_TOKEN_EXPIRATION_DAYS:7}
```

### Automatic Token Refresh

Axios includes a response interceptor that automatically handles expired access tokens.

When a protected request returns HTTP `401`:

```text
Protected request
        │
        ▼
401 Unauthorized
        │
        ▼
POST /auth/refresh
        │
        ▼
Refresh token validated
        │
        ├── New Access Token
        └── New Refresh Token
        │
        ▼
Original request retried
```

If multiple API requests receive HTTP `401` simultaneously, they share the same refresh operation.

This prevents several `/auth/refresh` requests from being executed at the same time.

### Refresh Token Rotation

Refresh tokens are rotated every time they are successfully used.

For example:

```text
Refresh Token A
      │
      ▼
POST /auth/refresh
      │
      ├── Token A → revoked
      │
      └── Token B → created
```

The previous refresh token cannot be reused after rotation.

This limits the impact of a leaked or replayed refresh token.

### Session Expiration

If the refresh token is invalid, expired, revoked, or belongs to a disabled user, the session cannot be renewed.

The frontend then:

1. Clears the access token and user information from `localStorage`.
2. Clears the authentication state stored in React.
3. Redirects the user to `/login`.

### Logout

Logout invalidates both the frontend and server-side session state.

```text
User logout
    │
    ▼
POST /auth/logout
    │
    ├── Refresh token revoked
    └── HttpOnly cookie removed
    │
    ▼
Frontend authentication state cleared
    │
    ▼
Redirect to /login
```

The logout operation clears the local authentication state even if the backend request fails, ensuring the user is never left authenticated in the frontend after requesting logout.

### Security Considerations

The authentication implementation includes:

- JWT access tokens with configurable short expiration.
- Refresh tokens generated using secure random values.
- SHA-256 refresh token hashing before database storage.
- HttpOnly refresh token cookies.
- Refresh token rotation.
- Server-side refresh token revocation.
- Disabled-user validation for both access and refresh tokens.
- Automatic session expiration handling.
- Protection against infinite refresh loops.
- Protection against concurrent refresh requests.
- Centralized authentication failure handling.


## License

Copyright © 2026 Diego González Sanz. All Rights Reserved.

This project is publicly available for portfolio, evaluation, and educational review purposes only.

Use, reproduction, modification, redistribution, commercial or non-commercial exploitation, or incorporation of this source code into other projects is not permitted without prior written permission from the copyright holder.

See the [LICENSE](./LICENSE) file for the complete terms.