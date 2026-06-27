# Auth API Contracts

**Feature**: 002-jwt-authentication | **Date**: 2026-06-26

**Bugfix**: 2026-06-26 — BUG-001 Reframed as Django REST API contracts (not TanStack Start server functions). Request/response shapes unchanged.

These contracts define the Django backend REST API endpoints that the frontend calls via `fetch()`. All endpoints are prefixed with `/api/auth/` and expect JSON request/response bodies. The frontend must include `credentials: 'include'` on all requests to send/receive the HTTP-only refresh token cookie.

## Common Types

```ts
// Success response wrapper
interface ApiSuccess<T> {
  success: true
  data: T
}

// Error response wrapper
interface ApiError {
  success: false
  error: {
    code: string        // Machine-readable error code
    message: string     // Human-readable error message
    field?: string      // Which form field caused the error (for validation errors)
  }
}

type ApiResponse<T> = ApiSuccess<T> | ApiError

// User public type (never includes password hash)
interface UserDto {
  id: string
  username: string
  email: string
  createdAt: string
}

// Auth tokens returned after successful login/signup
interface AuthTokens {
  accessToken: string    // 15 min expiry
  user: UserDto
}
```

---

## POST /api/auth/signup

Create a new account and authenticate.

### Request
```ts
interface SignUpRequest {
  username: string   // 3-30 chars, alphanumeric + underscore/hyphen
  email: string      // Valid email format
  password: string   // Minimum 8 characters
}
```

### Responses

**201 — Created**
```ts
interface SignUpResponse {
  accessToken: string
  user: UserDto
}
// Sets refresh_token in HTTP-only cookie
```

**409 — Conflict**
```ts
{ success: false, error: { code: "USERNAME_TAKEN", message: "Username is already registered", field: "username" } }
// OR
{ success: false, error: { code: "EMAIL_TAKEN", message: "Email is already registered", field: "email" } }
```

**422 — Validation Error**
```ts
{ success: false, error: { code: "VALIDATION_ERROR", message: "...", field: "..." } }
```

---

## POST /api/auth/login

Authenticate an existing user.

### Request
```ts
interface LoginRequest {
  username: string
  password: string
}
```

### Responses

**200 — Success**
```ts
interface LoginResponse {
  accessToken: string
  user: UserDto
}
// Sets refresh_token in HTTP-only cookie
```

**401 — Invalid Credentials**
```ts
{ success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid username or password" } }
```

---

## POST /api/auth/logout

Invalidate the current session.

### Request
No body. Refresh token read from HTTP-only cookie.

### Responses

**200 — Success**
```ts
{ success: true, data: null }
// Clears refresh_token cookie
```

---

## GET /api/auth/refresh

Silent token refresh — issue a new access token using a valid refresh token.

### Request
No body. Refresh token read from HTTP-only cookie.

### Responses

**200 — Success**
```ts
{ success: true, data: { accessToken: string; user: UserDto } }
```

**401 — Invalid/Expired Refresh Token**
```ts
{ success: false, error: { code: "INVALID_REFRESH_TOKEN", message: "Session expired. Please log in again." } }
// Clears refresh_token cookie
```

---

## GET /api/auth/me

Return the currently authenticated user. Used to hydrate client state on page load.

### Request
No body. Access token from Authorization header, or refresh token from cookie.

### Responses

**200 — Success**
```ts
{ success: true, data: { user: UserDto } }
```

**401 — Unauthenticated**
```ts
{ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } }
```

---

## POST /api/auth/forgot-password

Request a password reset link.

### Request
```ts
interface ForgotPasswordRequest {
  email: string
}
```

### Responses

**200 — Success (always, to prevent email enumeration)**
```ts
{ success: true, data: { message: "If an account with that email exists, a reset link has been sent." } }
```

In v1, the reset link is returned in the data for development:
```ts
{ success: true, data: { resetLink: "/reset-password?token=..." } }
```

---

## POST /api/auth/reset-password

Set a new password using a valid reset token.

### Request
```ts
interface ResetPasswordRequest {
  token: string       // From URL search params
  password: string    // Minimum 8 characters
}
```

### Responses

**200 — Success**
```ts
{ success: true, data: { message: "Password has been reset. You may now log in." } }
```

**400 — Invalid/Expired Token**
```ts
{ success: false, error: { code: "INVALID_RESET_TOKEN", message: "Reset link is invalid or has expired." } }
```

---

## POST /api/auth/change-password

Change password for the currently authenticated user.

### Request
```ts
interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string   // Minimum 8 characters, must differ from currentPassword
}
```

Requires valid access token (Authorization header) or refresh token (cookie).

### Responses

**200 — Success**
```ts
{ success: true, data: { message: "Password changed successfully. Please log in again." } }
// In all existing refresh tokens for this user
// Clears refresh_token cookie
```

**401 — Invalid Current Password**
```ts
{ success: false, error: { code: "INVALID_CURRENT_PASSWORD", message: "Current password is incorrect", field: "currentPassword" } }
```

**422 — Same Password**
```ts
{ success: false, error: { code: "SAME_PASSWORD", message: "New password must differ from current password", field: "newPassword" } }
```

---

## Error Codes Reference

| Code | HTTP Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 422 | Form input failed validation |
| `USERNAME_TAKEN` | 409 | Username already registered |
| `EMAIL_TAKEN` | 409 | Email already registered |
| `INVALID_CREDENTIALS` | 401 | Wrong username or password |
| `INVALID_REFRESH_TOKEN` | 401 | Refresh token expired or invalid |
| `INVALID_RESET_TOKEN` | 400 | Password reset token expired or used |
| `INVALID_CURRENT_PASSWORD` | 401 | Current password incorrect on change |
| `SAME_PASSWORD` | 422 | New password matches current |
| `UNAUTHORIZED` | 401 | No valid authentication provided |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
