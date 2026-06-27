# Data Model: JWT Authentication System

**Feature**: 002-jwt-authentication | **Date**: 2026-06-26

**Bugfix**: 2026-06-26 — BUG-001 These entities are Django models, not D1 tables. D1 schemas struck through. TypeScript types retained as frontend reference (matching Django's API response shapes).

> **Important**: All entities below are stored and managed by the Django backend. The frontend Workers have no database. These definitions exist only to document the API response shapes used in the TypeScript types.

## Entities _(Django models — not frontend D1 tables)_

### User

Represents a registered account with local username/password authentication.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `string` (ULID) | Primary key, unique | Unique user identifier |
| `username` | `string` | UNIQUE NOT NULL, 3-30 chars, `[a-zA-Z0-9_-]` | User's chosen display/login name |
| `email` | `string` | UNIQUE NOT NULL, valid email format | User's email (for password reset) |
| `password_hash` | `string` | NOT NULL | PBKDF2 hashed password (format: `salt:hash`, base64) |
| `created_at` | `string` (ISO 8601) | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |

**Uniqueness rules**: Both `username` and `email` are globally unique (case-insensitive for login purposes).

~~**D1 Schema**:~~ _(Not used — Django manages its own PostgreSQL schema)_
```sql
-- REMOVED: Django manages users table
```

**TypeScript type**:
```ts
interface User {
  id: string
  username: string
  email: string
  createdAt: string
}
```

### PasswordResetToken

Represents an active password reset request. Invalidated after use or expiry.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `string` (ULID) | Primary key | Token identifier |
| `user_id` | `string` | FOREIGN KEY → users(id), NOT NULL | The user requesting reset |
| `token` | `string` | UNIQUE NOT NULL | Random token sent via email link |
| `expires_at` | `string` (ISO 8601) | NOT NULL | Expiration timestamp (1 hour from creation) |
| `used` | `integer` | NOT NULL, DEFAULT 0 | 0 = valid, 1 = used |

~~**D1 Schema**:~~ _(Not used — Django manages its own schema)_
```sql
-- REMOVED: Django manages password_reset_tokens table
```

### RefreshToken

Represents an active session for session persistence.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `string` (ULID) | Primary key | Token identifier |
| `user_id` | `string` | FOREIGN KEY → users(id), NOT NULL | The authenticated user |
| `token` | `string` | UNIQUE NOT NULL | Refresh token (stored in HTTP-only cookie) |
| `expires_at` | `string` (ISO 8601) | NOT NULL | Expiration timestamp (7 days from creation) |
| `created_at` | `string` (ISO 8601) | NOT NULL | Creation timestamp |

~~**D1 Schema**:~~ _(Not used — Django manages its own schema)_
```sql
-- REMOVED: Django manages refresh_tokens table
```

## State Transitions

### User Account

```
[Visitor] ──signup──▶ [Active User]
[Active User] ──password change──▶ [Active User] (all sessions invalidated)
[Active User] ──password reset──▶ [Active User] (all sessions invalidated)
```

### Password Reset Token

```
[Requested] ──email sent──▶ [Pending]
[Pending] ──user clicks link + sets password──▶ [Used]
[Pending] ──expires (1 hour)──▶ [Expired]
[Pending] ──new reset requested (same user)──▶ [Superseded] (old token invalidated)
```

### Auth Session (Refresh Token)

```
[Created] ──issued on login/signup──▶ [Active]
[Active] ──user logs out──▶ [Revoked] (deleted)
[Active] ──password change/reset──▶ [Revoked] (all user tokens deleted)
[Active] ──expires (7 days)──▶ [Expired]
```

## Relationships

```
User 1 ──── N RefreshToken
     │
     └─── N PasswordResetToken
```

- A User has zero or more active RefreshTokens (sessions)
- A User has zero or one active PasswordResetToken (most recent supersedes previous)
- On password change or reset, all RefreshTokens for that User are deleted
- On new password reset request, previous PasswordResetTokens for that User are marked used/superseded

## Data Access Patterns _(frontend calls Django API — no direct DB access)_

| Operation | API Call | Frequency |
|---|---|---|
| Create user | `POST /api/auth/signup/` | On signup |
| Authenticate user | `POST /api/auth/login/` | On login |
| Get current user | `GET /api/auth/me/` | On session init / page load |
| Request password reset | `POST /api/auth/forgot-password/` | On forgot password |
| Reset password | `POST /api/auth/reset-password/` | On reset link click |
| Change password | `POST /api/auth/change-password/` | On password change |
| Refresh token | `POST /api/auth/refresh/` | On silent refresh |
| Logout | `POST /api/auth/logout/` | On logout |
