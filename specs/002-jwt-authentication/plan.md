# Implementation Plan: JWT Authentication System

**Branch**: `authentication` | **Date**: 2026-06-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-jwt-authentication/spec.md`

**Bugfix**: 2026-06-26 — BUG-001 Shifted from Workers-as-auth-server (D1, jose, PBKDF2) to Django API client. All server-side auth logic removed from Workers; frontend calls Django REST API endpoints. Removed `jose` dependency, D1 bindings, `server/` directory.
**Bugfix**: 2026-06-26 — BUG-002 Extracted project-wide `request<T>()` fetch wrapper and `API_BASE` into `src/lib/api-client.ts` so all features can call Django endpoints without depending on the auth feature.

## Summary

Implement a complete JWT authentication system with sign-up, login, password reset, password change, protected routes, and session persistence. The system uses shadcn/ui form components with Zod validation, Zustand for client-side auth state, and TanStack Router's context mechanism for route-level auth access. **Server-side auth logic runs in a pre-existing Django backend** — the frontend Workers act as a client calling Django's REST API endpoints. ~~Server-side auth logic runs inside Cloudflare Workers using D1 for user storage, the Web Crypto API for password hashing, and `jose` for JWT operations.~~

## Technical Context

**Language/Version**: TypeScript 6.0, React 19.2

**Primary Dependencies**: TanStack Start (router, SSR), shadcn/ui (radix), zod 4, zustand, jose, Cloudflare Workers

**Storage**: ~~Cloudflare D1 (SQLite) — `users`, `password_reset_tokens`, `refresh_tokens` tables~~ Django backend (PostgreSQL) — all data managed by Django; frontend consumes via REST API

**Testing**: Vitest + @testing-library/react

**Target Platform**: Cloudflare Workers (nodejs_compat)

**Project Type**: ~~Full-stack web application (SSR React + Workers backend)~~ Frontend web application (SSR React on Workers) consuming a Django REST API backend

**Performance Goals**: Auth check <50ms on protected routes, form validation <500ms inline

**Constraints**: ~~No external auth services, no email sending in v1 (reset links generated but email delivery is mocked/deferred)~~ Auth services provided by Django backend; email sending handled by Django; HTTP-only cookies for refresh tokens (set by Django, forwarded by Workers)

**Scale/Scope**: v1 small scale (hundreds of users), 6 routes (login, signup, forgot-password, reset-password, change-password, dashboard)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle | Status | Notes |
|---|---|---|
| I. Simplicity over Cleverness | ✅ Pass | Standard auth patterns, no custom crypto, no over-engineering |
| II. Explicit over Implicit | ✅ Pass | Auth state explicitly passed via router context, not hidden globals |
| III. Readability over Brevity | ✅ Pass | Auth flows broken into small, named functions; schemas clearly defined |
| IV. Type Safety over Convenience | ✅ Pass | Zod schemas → inferred types; no `any`; discriminated unions for auth states |
| V. Server-First | ✅ Pass | JWT verification, password hashing, user queries all server-side; client components only for interactive forms |
| VI. Composition over Inheritance | ✅ Pass | Auth features composed (schemas → stores → components → routes), no class hierarchies |
| VII. Convention over Configuration | ✅ Pass | Follows existing project structure: `features/auth/`, `routes/`, TanStack Start conventions |
| VIII. Performance is a Feature | ✅ Pass | Auth state read from memory (Zustand); JWT verification is O(1); no unnecessary re-renders |
| IX. Security is Never Optional | ✅ Pass | Passwords hashed (PBKDF2), refresh tokens HTTP-only, same response for invalid emails on reset, FR-016 (anti-enumeration) |
| X. Consistency over Personal Preference | ✅ Pass | Follows existing naming, directory structure, and shadcn component patterns |

**Gate Result**: All pass. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/002-jwt-authentication/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── auth-api.md      # Server-side auth API contracts
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── features/
│   └── auth/
│       ├── components/              # Auth UI components
│       │   ├── sign-up-form.tsx     # Username + email + password form
│       │   ├── login-form.tsx       # Username + password form
│       │   ├── forgot-password-form.tsx   # Email input for reset request
│       │   ├── reset-password-form.tsx    # New password form (token-gated)
│       │   ├── change-password-form.tsx   # Current + new password (authenticated)
│       │   └── auth-guard.tsx       # Client-side route protection wrapper
│       ├── schemas/
│       │   └── auth.ts             # Zod schemas for all auth forms
│       ├── store/
│       │   └── auth-store.ts       # Zustand store: user, accessToken, isAuthenticated
│       ├── api/                     # Auth-specific API endpoint functions
│       │   └── client.ts           # Typed fetch wrappers for auth endpoints (imports shared client from src/lib/)
│       └── types.ts                # Auth-specific types (User, AuthState, TokenPayload)
├── server/                          # ~~REMOVED: server/auth.ts, server/db.ts, server/cookies.ts~~
├── routes/
│   ├── __root.tsx                   # UPDATED: add auth to router context
│   ├── index.tsx                    # Landing page (existing, unchanged)
│   ├── login.tsx                    # Login page (server: validate + issue tokens)
│   ├── signup.tsx                   # Sign-up page (server: create user + issue tokens)
│   ├── forgot-password.tsx          # Request password reset (server: create token)
│   ├── reset-password.tsx           # Set new password (server: verify token + update)
│   ├── change-password.tsx          # Change password (server: verify + update)
│   └── _authenticated/             # Protected route group
│       ├── route.tsx                # Layout: verifies auth, redirects if unauthenticated
│       └── dashboard.tsx            # Example protected page
├── lib/
│   ├── api-client.ts                # Shared fetch wrapper: request<T>(), API_BASE, credentials, error handling
│   └── utils.ts                     # Existing utilities (unchanged)
├── integrations/
│   └── tanstack-query/
│       ├── root-provider.tsx        # UPDATED: merge auth context
│       └── devtools.tsx             # Unchanged
├── router.tsx                       # UPDATED: extend router context with auth
├── routeTree.gen.ts                # Auto-generated (tsr generate)
└── styles.css                       # Existing styles, auth form additions
```

**Structure Decision**: Follows the existing project architecture documented in the constitution. Auth logic is isolated under `src/features/auth/` with a clear separation: `schemas/` for validation, `store/` for client state, `components/` for UI. Routes are thin — they compose components and call API functions. The shared `request<T>()` fetch wrapper and `API_BASE` live in `src/lib/api-client.ts` as cross-cutting infrastructure — every feature's API client module imports from this shared foundation.

## Architecture: Auth Context per Route

The user's requirement for auth context accessible to each route is met via TanStack Router's built-in context mechanism:

```
SSR Request
    │
    ▼
getContext(request)                          # router.tsx
    ├── Forwards refresh_token cookie to Django GET /api/auth/me/
    ├── Receives UserDto (if valid session)
    └── Returns { queryClient, auth }
              │
              ▼
createTanStackRouter({ context })           # router.tsx
              │
              ▼
MyRouterContext { auth: AuthState }         # __root.tsx
              │
              ▼
Any route accesses via:
  const { auth } = Route.useRouteContext()  # Protected routes
  route.options.beforeLoad({ context })     # Route guards
```

**Client-side auth via Zustand**:
```
Client navigates to /login
    │
    ▼
LoginForm → Zod validation → fetch(POST /api/auth/login/)
    │
    ▼
Django responds: { accessToken, user } + Set-Cookie: refresh_token
    │
    ▼
Zustand store: setAuth(user, accessToken)
    │
    ▼
navigate(to: savedRedirect || '/dashboard')
```

**AuthState type:**
```ts
type AuthState =
  | { isAuthenticated: true; user: User; isLoading: false }
  | { isAuthenticated: false; user: null; isLoading: false }
  | { isAuthenticated: false; user: null; isLoading: true }
```

**Protected route pattern** (`_authenticated/route.tsx`):
```ts
export const Route = createRoute({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
  },
  component: AuthenticatedLayout,
})
```

## Complexity Tracking

No constitution violations. No complexity to justify.

## Dependencies to Add

| Package | Purpose | Install |
|---|---|---|
| `zustand` | Client auth state + session persistence | `bun add zustand` |
| `@tanstack/react-form` | Form state management with Zod adapter | `bun add @tanstack/react-form @tanstack/zod-form-adapter` |
| ~~`jose`~~ | ~~JWT sign/verify~~ REMOVED — Django handles JWT | — |
| ~~`shadcn form`~~ | Replaced by TanStack Form + Zod adapter | — |
| `shadcn input` | Input component (manually created) | — |

## Route Design

| Route | Path | Auth Required | Django API Called |
|---|---|---|---|
| Landing | `/` | No | — |
| Login | `/login` | No (redirect if auth) | `POST /api/auth/login/` |
| Sign Up | `/signup` | No (redirect if auth) | `POST /api/auth/signup/` |
| Forgot Password | `/forgot-password` | No | `POST /api/auth/forgot-password/` |
| Reset Password | `/reset-password` | No (token in search params) | `POST /api/auth/reset-password/` |
| Change Password | `/change-password` | Yes | `POST /api/auth/change-password/` |
| Dashboard | `/dashboard` | Yes | — |

## Auth Flow Summary

### Sign Up
```
Client: SignUpForm → Zod validation → fetch(POST /api/auth/signup/, { body })
Django: Validate input → Check uniqueness → Hash password → Insert user → Create JWT → Set refresh cookie
Client: Store access token in Zustand → Redirect to dashboard
```

### Login
```
Client: LoginForm → Zod validation → fetch(POST /api/auth/login/, { body })
Django: Find user by username → Verify password → Create JWT → Set refresh cookie
Client: Store access token in Zustand → Redirect to dashboard (or saved redirect)
```

### Session Persistence (page reload)
```
Client: App mounts → fetch(POST /api/auth/refresh/, { credentials: 'include' })
Django: Verify refresh cookie → Issue new access token → Rotate refresh token
Client: Update Zustand store with fresh access token
```

### Protected Route Access
```
Client: Navigate to /dashboard
Router: beforeLoad checks context.auth.isAuthenticated
  → true: render page
  → false: redirect to /login?redirect=/dashboard
```

### Password Reset
```
Client: ForgotPasswordForm → fetch(POST /api/auth/forgot-password/, { body })
Django: Find user by email → Create reset token → Send email with reset link
Client: Shows confirmation → receives reset link via email
Client: ResetPasswordForm → fetch(POST /api/auth/reset-password/, { body })
Django: Verify token → Hash new password → Update user → Invalidate all sessions
Client: Redirect to /login
```

### Password Change
```
Client: ChangePasswordForm → fetch(POST /api/auth/change-password/, { body, credentials: 'include' })
Django: Verify current password → Hash new password → Update user → Invalidate all sessions
Client: Clear auth state → Redirect to /login
```
