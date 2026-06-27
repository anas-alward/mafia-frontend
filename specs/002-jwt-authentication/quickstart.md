# Quickstart: JWT Authentication System

**Feature**: 002-jwt-authentication | **Date**: 2026-06-26

## Prerequisites

- Bun installed (package manager)
- Cloudflare account with D1 database created
- `wrangler.jsonc` configured with D1 binding
- All dependencies installed (`bun install`)
- shadcn form + input components added (`npx shadcn add form input`)

## Setup

```bash
# 1. Install new dependencies
bun add zustand jose
bun add -D @hookform/resolvers

# 2. Add shadcn components
npx shadcn add form input

# 3. Create D1 database (if not exists)
wrangler d1 create mafia-db

# 4. Apply schema
wrangler d1 execute mafia-db --file=src/features/auth/server/schema.sql

# 5. Set JWT secret (generate a random 256-bit key)
openssl rand -base64 32
# Add to .dev.vars: JWT_SECRET=<generated-key>

# 6. Generate routes
bun run generate-routes

# 7. Start dev server
bun run dev
```

## Validation Scenarios

### 1. Sign Up Flow

```bash
# Start dev server, then:
# 1. Navigate to http://localhost:3000/signup
# 2. Fill in: username="testuser", email="test@example.com", password="password123"
# 3. Submit form
# 4. Verify: redirected to /dashboard, site header shows authenticated state
# 5. Verify: refresh_token cookie is set (HTTP-only, check DevTools > Application > Cookies)
```

### 2. Login Flow

```bash
# 1. Navigate to http://localhost:3000/login
# 2. Fill in: username="testuser", password="password123"
# 3. Submit form
# 4. Verify: redirected to /dashboard
```

### 3. Protected Route Enforcement

```bash
# 1. Open incognito/private window
# 2. Navigate to http://localhost:3000/dashboard
# 3. Verify: redirected to /login?redirect=/dashboard
# 4. Log in with valid credentials
# 5. Verify: redirected to /dashboard
```

### 4. Session Persistence

```bash
# 1. Log in successfully
# 2. Close browser tab completely
# 3. Open new tab, navigate to http://localhost:3000/dashboard
# 4. Verify: page loads without redirect to /login (silent refresh succeeded)
```

### 5. Logout

```bash
# 1. Log in successfully
# 2. Click logout button
# 3. Verify: redirected to landing page
# 4. Navigate to /dashboard
# 5. Verify: redirected to /login
```

### 6. Password Reset Flow

```bash
# 1. Navigate to /login, click "Forgot password?"
# 2. Enter email="test@example.com"
# 3. Submit form
# 4. Verify: success message shown, reset link returned (check dev console/network)
# 5. Navigate to reset link (e.g., /reset-password?token=...)
# 6. Enter new password="newpassword123"
# 7. Submit form
# 8. Verify: redirected to /login
# 9. Log in with username="testuser", password="newpassword123"
# 10. Verify: login succeeds
```

### 7. Password Change Flow

```bash
# 1. Log in
# 2. Navigate to /change-password
# 3. Enter currentPassword="newpassword123", newPassword="evennewer456"
# 4. Submit form
# 5. Verify: logged out (all sessions invalidated), redirected to /login
# 6. Log in with new password
# 7. Verify: login succeeds
```

### 8. Validation Errors

```bash
# Signup validation:
# 1. Submit empty form → verify inline errors on all fields
# 2. Submit username="ab" → verify "min 3 characters" error
# 3. Submit email="notanemail" → verify "invalid email" error
# 4. Submit password="short" → verify "min 8 characters" error

# Login validation:
# 1. Submit wrong password → verify "invalid username or password" error (not "wrong password" — no info leak)

# Duplicate signup:
# 1. Sign up with same username → verify "username already registered" error
# 2. Sign up with same email → verify "email already registered" error
```

## Key Files Reference

| File | Purpose |
|---|---|
| `src/features/auth/schemas/auth.ts` | All Zod validation schemas |
| `src/features/auth/store/auth-store.ts` | Zustand auth state |
| `src/features/auth/server/auth.ts` | JWT sign/verify, password hash/verify |
| `src/features/auth/server/db.ts` | D1 user CRUD operations |
| `src/features/auth/components/*.tsx` | Auth form components |
| `src/routes/login.tsx` | Login route |
| `src/routes/signup.tsx` | Sign-up route |
| `src/routes/_authenticated/route.tsx` | Auth guard layout |
