# Tasks: JWT Authentication System

**Input**: Design documents from `/specs/002-jwt-authentication/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not included (not requested in specification). Each user story has an independent test criterion for manual validation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Bugfix**: 2026-06-26 — BUG-001 Reopened 15 falsely completed tasks (T004, T005, T008-T012, T018, T022, T030, T033, T036, T038-T040) that contained Workers-as-auth-server logic. Added 6 new tasks (T047–T052) for Django API client layer. The implementation must call Django REST API endpoints instead of self-hosting auth logic.
**Bugfix**: 2026-06-26 — BUG-002 Added 2 new tasks (T053, T054) to extract the project-wide `request<T>()` fetch wrapper and `API_BASE` into `src/lib/api-client.ts` so all features can call Django without depending on the auth feature.
**Bugfix**: 2026-06-26 — BUG-003 Reopened 7 tasks (T007, T017, T018, T019, T021, T022, T046) for email verification after signup (two-step flow) and login with email instead of username. Added 3 new tasks (T055–T057).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, add shadcn components, and create D1 database schema

- [x] T001 Install new dependencies: zustand, jose, @hookform/resolvers via `bun add zustand jose @hookform/resolvers`
- [x] T002 Add shadcn form component via `npx shadcn add form` (manual fallback: TanStack Form used instead of react-hook-form)
- [x] T003 Add shadcn input component via `npx shadcn add input` (manual creation due to registry auth error)
- [x] T004 Remove D1 database schema SQL at src/features/auth/server/schema.sql — Django manages its own database (reopened — BUG-001)
- [x] T005 Remove D1 binding from wrangler.jsonc — no D1 database needed (reopened — BUG-001)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core auth infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 [P] Create auth TypeScript types in src/features/auth/types.ts (User, AuthState, TokenPayload, UserDto per data-model.md and contracts/)
- [x] T007 [P] Create Zod validation schemas in src/features/auth/schemas/auth.ts (username, email, password rules; all form schemas per contracts/auth-api.md) (updated — BUG-003: loginSchema uses email instead of username; verifyEmailSchema added)
- [x] T008 Remove JWT helpers from src/features/auth/server/auth.ts — Django handles JWT sign/verify; `jose` dependency no longer needed (reopened — BUG-001)
- [x] T009 Remove password hashing helpers from src/features/auth/server/auth.ts — Django hashes passwords via its own configured algorithm (reopened — BUG-001)
- [x] T010 Remove server-side cookie helpers from src/features/auth/server/cookies.ts — Django sets/clears the refresh_token cookie; Workers forward it (reopened — BUG-001)
- [x] T011 Remove D1 user DB helpers from src/features/auth/server/db.ts — replaced by Django API calls via client.ts (reopened — BUG-001)
- [x] T012 Remove D1 token DB helpers from src/features/auth/server/db.ts — replaced by Django API calls via client.ts (reopened — BUG-001)
- [x] T013 [P] Create Zustand auth store in src/features/auth/store/auth-store.ts (user, accessToken, isAuthenticated, isLoading, login action, logout action, setLoading action)
- [x] T014 Update router context in src/integrations/tanstack-query/root-provider.tsx to include auth in getContext return value
- [x] T015 Update src/router.tsx to accept extended context with auth property
- [x] T016 Update src/routes/__root.tsx MyRouterContext interface to include auth: AuthState

- [x] T047 [P] Create API client module in src/features/auth/api/client.ts with typed fetch wrappers for all 8 Django auth endpoints (signup, login, logout, refresh, me, forgot-password, reset-password, change-password) per contracts/auth-api.md
- [x] T048 [P] Add VITE_API_BASE_URL environment variable configuration (`.env` file, default `http://localhost:8000`) for Django API base URL
- [x] T049 [P] Remove deprecated server-side files: src/features/auth/server/auth.ts (JWT + PBKDF2), src/features/auth/server/db.ts (D1 helpers), src/features/auth/server/cookies.ts, src/features/auth/server/session.ts, src/features/auth/server/schema.sql
- [x] T050 Remove `jose` dependency via `bun remove jose` — no longer needed since Django handles JWT
- [x] T051 Update getContext() in src/integrations/tanstack-query/root-provider.tsx to call Django GET /api/auth/me/ on SSR (forward refresh cookie, receive UserDto, populate auth context)
- [x] T052 Update SessionInit in src/features/auth/components/session-init.tsx to call Django POST /api/auth/refresh/ via fetch() with credentials: 'include' instead of TanStack Start server function
- [x] T053 [P] Extract project-wide fetch wrapper into src/lib/api-client.ts: export `request<T>()` helper, `API_BASE` resolution (from VITE_API_BASE_URL env, default `http://localhost:8000`), shared types (`ApiSuccess<T>`, `ApiError`); keep `credentials: 'include'` and `Content-Type: application/json` as defaults
- [x] T054 Refactor src/features/auth/api/client.ts to import `request` and `API_BASE` from `#/lib/api-client` — keep only auth-specific endpoint functions and types; also update src/integrations/tanstack-query/root-provider.tsx to import `API_BASE` from shared client instead of inline constant

**Checkpoint**: Foundation ready — shared API client in lib/, auth-specific endpoints in features/auth/api/, store and router context all wired. User story implementation can now begin with fetch() calls to Django.

---

## Phase 3: User Story 1 - User Sign Up (Priority: P1) 🎯 MVP

**Goal**: A visitor can create an account with username, email, and password, then be authenticated and redirected

**Independent Test**: Fill sign-up form with valid credentials, verify account created, verify authenticated and redirected to dashboard

### Implementation for User Story 1

- [x] T017 [P] [US1] Create sign-up form component in src/features/auth/components/sign-up-form.tsx (username, email, password fields with Zod validation via TanStack Form) (updated — BUG-003: converted to two-step flow with email verification code input)
- [x] T018 [US1] ⚠️ Reopened: Rewrite signUpFn to call Django POST /api/auth/signup/ via fetch() instead of creating user in D1 (reopened — BUG-001) (updated — BUG-003: signUp no longer returns AuthTokens directly; tokens come from verifyEmail after email verification)
- [x] T019 [US1] Create signup route in src/routes/signup.tsx (compose SignUpForm, handle success/error, redirect) (updated — BUG-003: routes through two-step flow: signup → verify email → auth + redirect; fixed accessToken → access)
- [x] T020 [US1] Add signup page link to site header (replace "Join the Game" with "Sign Up" / "Login" based on auth state)

**Checkpoint**: User Story 1 complete — new users can create accounts and be authenticated

---

## Phase 4: User Story 2 - User Login (Priority: P1) 🎯 MVP

**Goal**: A registered user can log in with username and password and be authenticated

**Independent Test**: Enter valid credentials for existing account, verify JWT issued, verify redirected to main application

### Implementation for User Story 2

- [x] T021 [P] [US2] Create login form component in src/features/auth/components/login-form.tsx (email, password fields with Zod validation via TanStack Form) (updated — BUG-003: username field changed to email)
- [x] T022 [US2] ⚠️ Reopened: Rewrite loginFn to call Django POST /api/auth/login/ via fetch() instead of querying D1 and hashing passwords (reopened — BUG-001) (updated — BUG-003: LoginRequest uses email instead of username)
- [x] T023 [US2] Create login route in src/routes/login.tsx (compose LoginForm, handle invalid credentials, redirect)
- [x] T024 [US2] Add "Forgot password?" link on login form navigating to /forgot-password

**Checkpoint**: User Stories 1 AND 2 complete — full authentication entry point (sign up + login) working

---

## Phase 5: User Story 5 - Protected Routes (Priority: P1) 🎯 MVP

**Goal**: Unauthenticated visitors are redirected to login when accessing protected routes; authenticated users see protected content

**Independent Test**: Attempt to access /dashboard without auth → redirected to /login. After login, /dashboard is accessible. Expired JWT → redirected to /login.

### Implementation for User Story 5

- [x] T025 [US5] Create auth guard component in src/features/auth/components/auth-guard.tsx (checks context.auth.isAuthenticated, renders children or redirect) (integrated into _authenticated/route.tsx beforeLoad)
- [x] T026 [US5] Create authenticated layout route in src/routes/_authenticated/route.tsx (beforeLoad checks auth, redirects to /login?redirect= with original URL if unauthenticated)
- [x] T027 [US5] Create example dashboard page in src/routes/_authenticated/dashboard.tsx (simple authenticated page showing username)
- [x] T028 [US5] Update site header to show auth state: authenticated header (username, logout link) vs unauthenticated header (Login, Sign Up links)

**Checkpoint**: Protected routes enforced — unauthenticated access redirects to login, authenticated access renders content

---

## Phase 6: User Story 3 - Password Reset (Priority: P2)

**Goal**: A user who forgot their password can request a reset via email and set a new password using a reset link

**Independent Test**: Request reset for existing account, receive reset link, set new password, log in with new password

### Implementation for User Story 3

- [x] T029 [P] [US3] Create forgot password form component in src/features/auth/components/forgot-password-form.tsx (email field with Zod validation)
- [x] T030 [US3] ⚠️ Reopened: Rewrite forgotPasswordFn to call Django POST /api/auth/forgot-password/ via fetch() (reopened — BUG-001)
- [x] T031 [US3] Create forgot password route in src/routes/forgot-password.tsx (compose ForgotPasswordForm, show confirmation message)
- [x] T032 [P] [US3] Create reset password form component in src/features/auth/components/reset-password-form.tsx (new password field with Zod validation, token from URL search params)
- [x] T033 [US3] ⚠️ Reopened: Rewrite resetPasswordFn to call Django POST /api/auth/reset-password/ via fetch() (reopened — BUG-001)
- [x] T034 [US3] Create reset password route in src/routes/reset-password.tsx (read token from search params, compose ResetPasswordForm, handle success/expired/invalid, redirect to login)

**Checkpoint**: Password reset flow complete — request via email, set new password via link, log in with new password

---

## Phase 7: User Story 4 - Password Change (Priority: P2)

**Goal**: An authenticated user can change their password by providing current password and new password

**Independent Test**: Log in, navigate to change password, submit current + new password, log out, verify old password fails and new password works

### Implementation for User Story 4

- [x] T035 [P] [US4] Create change password form component in src/features/auth/components/change-password-form.tsx (current password, new password fields with Zod validation)
- [x] T036 [US4] ⚠️ Reopened: Rewrite changePasswordFn to call Django POST /api/auth/change-password/ via fetch() (reopened — BUG-001)
- [x] T037 [US4] Create change password route in src/routes/change-password.tsx (protected, compose ChangePasswordForm, handle success/invalid-current/same-password, clear auth + redirect)

**Checkpoint**: Password change complete — authenticated users can update their password

---

## Phase 8: User Story 6 - Session Persistence & Logout (Priority: P3)

**Goal**: Authenticated users stay logged in across page reloads (silent refresh). Users can explicitly log out.

**Independent Test**: Log in, close and reopen browser, verify still authenticated. Click logout, verify session terminated and redirected to landing page.

### Implementation for User Story 6

- [x] T038 [US6] ⚠️ Reopened: Rewrite refreshFn to call Django POST /api/auth/refresh/ via fetch() with credentials: 'include' (reopened — BUG-001)
- [x] T039 [US6] ⚠️ Reopened: Rewrite logoutFn to call Django POST /api/auth/logout/ via fetch() with credentials: 'include' (reopened — BUG-001)
- [x] T040 [US6] ⚠️ Reopened: Update SessionInit to call Django refresh endpoint via fetch() instead of TanStack Start server function (reopened — BUG-001)
- [x] T041 [US6] Add logout button to site header (visible when authenticated) that calls logoutFn, clears store, redirects to landing page

**Checkpoint**: Session persistence working — users stay logged in across browser sessions. Logout terminates session.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, UI polish, and validation across all stories

- [x] T042 Implement shared error display component in src/features/auth/components/auth-error.tsx (maps error codes to user-friendly messages per contracts/auth-api.md error codes)
- [x] T043 Add submit button loading/disabled state on all auth forms to prevent double submission (per spec Edge Cases)
- [x] T044 Add redirect preservation: when redirected to /login from protected route, post-login redirects back to original URL per FR-009
- [x] T045 Style all auth pages to match minimalist design system (white background, zinc/chromatic gray palette) per spec Assumptions and consistent with landing page
- [x] T046 Run through all quickstart.md validation scenarios and fix issues (build passes, all routes created, manual validation requires live dev server + D1 setup)
- [x] T055 [P] [US1] Add verifyEmail endpoint function and VerifyEmailRequest type in src/features/auth/api/client.ts (BUG-003)
- [x] T056 [P] [US1] Add verifyEmailSchema and VerifyEmailInput type in src/features/auth/schemas/auth.ts (BUG-003)
- [x] T057 [US1] Convert SignUpForm to two-step flow with email verification code input in src/features/auth/components/sign-up-form.tsx (BUG-003)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 - Sign Up (Phase 3)**: Depends on Foundational (Phase 2)
- **US2 - Login (Phase 4)**: Depends on Foundational (Phase 2) — needs existing users from US1 for full test, but DB helpers from Phase 2 are sufficient to implement
- **US5 - Protected Routes (Phase 5)**: Depends on Foundational (Phase 2) — only needs auth context and store, testable with manual auth state
- **US3 - Password Reset (Phase 6)**: Depends on Foundational (Phase 2) — needs users in DB
- **US4 - Password Change (Phase 7)**: Depends on Foundational (Phase 2) and US5 (needs authenticated route guard)
- **US6 - Session Persistence (Phase 8)**: Depends on US2 (needs login to issue refresh tokens)
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

| Story | Priority | Can Start After | Notes |
|---|---|---|---|
| US1 - Sign Up | P1 | Phase 2 | No story dependencies |
| US2 - Login | P1 | Phase 2 | Logically paired with US1 |
| US5 - Protected Routes | P1 | Phase 2 | Only needs auth context from Phase 2 |
| US3 - Password Reset | P2 | Phase 2 | Needs users in DB |
| US4 - Password Change | P2 | Phase 2 + Phase 5 | Needs authenticated route (US5) |
| US6 - Session Persistence | P3 | Phase 2 + Phase 4 | Needs login to exist (US2) |

### Within Each Phase

- Server helpers before server functions
- Form components before routes (route composes form)
- Server functions before route wiring (route calls server function)
- Core implementation before integration

### Parallel Opportunities

- All Phase 1 tasks except T004-T005 can run in parallel (T001-T003 are sequential due to shell commands)
- Phase 2: T006-T013 can all be written in parallel (separate files, no runtime dependencies at write time)
- Phase 2: T014-T016 depend on T006 and T013
- US1 and US2 can be implemented in parallel by different developers
- US3 and US4 can be implemented in parallel (different features)
- US5 can run in parallel with US1/US2 (only needs Phase 2 context)
- Form components (T017, T021, T029, T032, T035) are all parallel across stories

---

## Parallel Example: Foundational Phase

```bash
# After T006 (types) is done, these can all run in parallel:
Task: "Create Zod validation schemas in src/features/auth/schemas/auth.ts"
Task: "Create JWT helpers in src/features/auth/server/auth.ts"
Task: "Create password hashing helpers in src/features/auth/server/auth.ts"
Task: "Create cookie helpers in src/features/auth/server/cookies.ts"
Task: "Create D1 user database helpers in src/features/auth/server/db.ts"
Task: "Create D1 token database helpers in src/features/auth/server/db.ts"
Task: "Create Zustand auth store in src/features/auth/store/auth-store.ts"
```

## Parallel Example: US3 + US4 After Foundational

```bash
# Password Reset and Password Change can be built concurrently:
# Developer A — US3:
Task: "Create forgot password form in src/features/auth/components/forgot-password-form.tsx"
Task: "Create forgot password route in src/routes/forgot-password.tsx"
Task: "Create reset password form in src/features/auth/components/reset-password-form.tsx"
Task: "Create reset password route in src/routes/reset-password.tsx"

# Developer B — US4:
Task: "Create change password form in src/features/auth/components/change-password-form.tsx"
Task: "Create change password route in src/routes/change-password.tsx"
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US5)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: US1 — Sign Up
4. Complete Phase 4: US2 — Login
5. Complete Phase 5: US5 — Protected Routes
6. **STOP and VALIDATE**: Sign up → Login → access protected route → verify redirect works
7. Deploy/demo MVP

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (Sign Up) → Users can create accounts **(MVP starts)**
3. US2 (Login) → Users can log in
4. US5 (Protected Routes) → Routes are protected **(MVP complete)**
5. US3 (Password Reset) → Account recovery
6. US4 (Password Change) → Credential management
7. US6 (Session Persistence) → Seamless experience across sessions
8. Polish → Production-ready

### Suggested MVP Scope

**MVP = Phase 1 + Phase 2 + Phase 3 + Phase 4 + Phase 5**

This delivers: sign up, login, and protected routes — the core authentication loop. Users can create accounts, log in, and access protected content. Password reset and change can ship as a follow-up increment.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- All server functions use TanStack Start's `createServerFn` with Zod validators
- Access tokens stored in Zustand (memory), refresh tokens in HTTP-only cookies
- Password reset emails are mocked in v1 — reset links returned in API response (per research.md Decision 7)
- Commit after each phase or logical task group
- Stop at any checkpoint to validate story independently
- Run `bun run generate-routes` after adding new route files
