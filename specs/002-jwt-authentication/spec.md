# Feature Specification: JWT Authentication System

**Feature Branch**: `002-jwt-authentication`

**Created**: 2026-06-26

**Status**: Draft

**Input**: User description: "authentications, where there is sign up and login form also the authentication system across the whole project jwt authentication system"

**Bugfix**: 2026-06-26 — BUG-001 Added Django backend assumption; clarified that password hashing, JWT operations, and user storage are handled by the existing Django backend, not implemented in the frontend Workers.

## Clarifications

### Session 2026-06-26

- Q: How should users reset a forgotten password? → A: Email reset link — user enters email, receives a one-time reset link, sets new password
- Q: Should the User model include a provider field for future OAuth providers (Google, etc.)? → A: No — multi-provider authentication will be a separate feature; v1 is local username/password only
- Q: Should auth endpoints have rate limiting? → A: Handled by backend — out of scope for this frontend specification

## User Scenarios & Testing _(mandatory)_

### User Story 1 - User Sign Up (Priority: P1)

A new visitor creates an account by providing their username, email, and password through a sign-up form. Upon successful registration, they are authenticated and redirected to the main application.

**Why this priority**: Without account creation, there are no users to authenticate. This is the entry point for the entire authentication flow.

**Independent Test**: Can be tested by filling out the sign-up form with valid credentials, verifying the account is created, and confirming the user is authenticated and redirected.

**Acceptance Scenarios**:

1. **Given** a visitor is on the sign-up page, **When** they submit a valid username, email, and password, **Then** their account is created and they are automatically authenticated and redirected to the main application.
2. **Given** a visitor is on the sign-up page, **When** they submit a username or email that is already registered, **Then** they see an error message indicating the field is already in use and the form is not submitted.
3. **Given** a visitor is on the sign-up page, **When** they submit a password shorter than the minimum length, **Then** they see a validation error and the form is not submitted.
4. **Given** a visitor is on the sign-up page, **When** they submit an invalid email format, **Then** they see a validation error and the form is not submitted.
5. **Given** a visitor is on the sign-up page, **When** they submit a username that does not meet format requirements, **Then** they see a validation error and the form is not submitted.

---

### User Story 2 - User Login (Priority: P1)

A registered user logs in with their username and password. Upon successful authentication, they receive a JWT and are redirected to the main application.

**Why this priority**: Login is the returning user's gateway. Without it, existing users cannot access the application. It is equally critical as sign-up.

**Independent Test**: Can be tested by entering valid credentials for an existing account, verifying a JWT is issued, and confirming the user is redirected.

**Acceptance Scenarios**:

1. **Given** a registered user is on the login page, **When** they submit correct username and password, **Then** they receive a valid JWT and are redirected to the main application.
2. **Given** a registered user is on the login page, **When** they submit incorrect credentials, **Then** they see an error message indicating invalid credentials and remain on the login page.
3. **Given** a user is already authenticated with a valid JWT, **When** they navigate to the login page, **Then** they are redirected to the main application without re-authentication.

---

### User Story 3 - Password Reset (Priority: P2)

A user who has forgotten their password can request a password reset by providing their email address. They receive an email with a one-time reset link that allows them to set a new password.

**Why this priority**: Account recovery is essential for real-world usability. Without it, users who forget their password are permanently locked out.

**Independent Test**: Can be tested by requesting a reset for an existing account, receiving the reset email, clicking the link, and setting a new password — then logging in with the new password.

**Acceptance Scenarios**:

1. **Given** a user is on the login page, **When** they click "Forgot password" and submit their registered email, **Then** a reset link is sent to their email and they see a confirmation message.
2. **Given** a user has received a valid reset link, **When** they click the link and submit a new password meeting requirements, **Then** their password is updated and they are redirected to the login page.
3. **Given** a user clicks an expired or already-used reset link, **When** they attempt to set a new password, **Then** they see an error message and are prompted to request a new reset link.
4. **Given** an unauthenticated visitor, **When** they submit an email not associated with any account for password reset, **Then** they still see a confirmation message (to prevent email enumeration) but no email is sent.

---

### User Story 4 - Password Change (Priority: P2)

An authenticated user can change their password from within the application by providing their current password and a new password.

**Why this priority**: Allows users to update credentials proactively for security hygiene. Lower priority than reset (recovery) but still an expected account management feature.

**Independent Test**: Can be tested by logging in, navigating to password change, submitting current + new password, logging out, and confirming the new password works.

**Acceptance Scenarios**:

1. **Given** an authenticated user is on the password change page, **When** they submit their current password and a valid new password, **Then** their password is updated and they see a success message.
2. **Given** an authenticated user is on the password change page, **When** they submit an incorrect current password, **Then** they see an error message and their password remains unchanged.
3. **Given** an authenticated user is on the password change page, **When** they submit a new password that matches the current password, **Then** they see a validation error.

---

### User Story 5 - Protected Routes (Priority: P1)

Authenticated users can access protected areas of the application. Unauthenticated visitors are redirected to the login page when attempting to access protected routes.

**Why this priority**: Protecting routes is the purpose of authentication. It depends on P1 (users must be able to sign up and log in first) but is independently testable once any authenticated user exists.

**Independent Test**: Can be tested by attempting to access a protected route without authentication (should redirect to login), then authenticating and verifying the protected route becomes accessible.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor, **When** they navigate to a protected route, **Then** they are redirected to the login page with the intended destination preserved.
2. **Given** an authenticated user with a valid JWT, **When** they navigate to a protected route, **Then** the page loads and they see the protected content.
3. **Given** an authenticated user whose JWT has expired, **When** they make a request to a protected route, **Then** they are redirected to the login page.
4. **Given** a user is redirected to login from a protected route, **When** they successfully authenticate, **Then** they are redirected back to the originally requested route.

---

### User Story 6 - Session Persistence & Logout (Priority: P3)

Authenticated users remain logged in across page reloads and browser sessions (within token validity). Users can explicitly log out, which invalidates their session.

**Why this priority**: Quality-of-life feature. The core auth flow works without it (users could re-login each visit), but it significantly improves UX.

**Independent Test**: Can be tested by logging in, closing and reopening the browser, and verifying the session is still active. Then logging out and confirming the session is terminated.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they close and reopen the browser, **Then** they remain authenticated (within the refresh token's validity period).
2. **Given** an authenticated user, **When** they click the logout button, **Then** their session is terminated and they are redirected to the landing page.
3. **Given** an authenticated user, **When** their refresh token expires, **Then** they are prompted to log in again on their next request.

---

### Edge Cases

- What happens when a user submits the sign-up or login form while a request is already in progress? The submit button should be disabled to prevent double submissions.
- What happens when the authentication server is unreachable? The user sees a friendly error message and can retry.
- What happens when a JWT is tampered with or malformed? The server rejects it, and the user is treated as unauthenticated.
- What happens when a user tries to access a non-existent route? Standard 404 behavior; authentication state should not affect this.
- What happens on token refresh failure (e.g., network error during silent refresh)? The user is not abruptly logged out; the next protected request triggers a redirect to login.
- What happens when a password reset email fails to send (e.g., email service downtime)? The user sees a friendly error message and can retry.
- What happens when a user requests multiple password resets in quick succession? Only the most recent reset link is valid; previous links are invalidated.
- What happens when a password reset link is used after the password has already been changed? The link is rejected and the user is prompted to request a new one.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST provide a sign-up form with username, email, and password fields.
- **FR-002**: The system MUST provide a login form with username and password fields.
- **FR-003**: The system MUST validate username format, email format, and password length on both client and server before processing.
- **FR-004**: The Django backend MUST hash user passwords before storage using a strong, modern hashing algorithm.
- **FR-005**: The Django backend MUST issue a JWT access token upon successful authentication (sign-up or login) and return it to the frontend.
- **FR-006**: The Django backend MUST issue a refresh token alongside the access token for session persistence, set as an HTTP-only cookie.
- **FR-007**: The system MUST redirect authenticated users away from the login and sign-up pages.
- **FR-008**: The system MUST redirect unauthenticated users to the login page when they attempt to access protected routes, preserving the originally requested URL.
- **FR-009**: The system MUST redirect users back to their originally requested route after successful login.
- **FR-010**: The system MUST provide a logout mechanism that invalidates the user's session.
- **FR-011**: The Django backend MUST verify the JWT on every request to a protected endpoint.
- **FR-012**: The Django backend MUST reject expired or malformed JWTs and return an appropriate error response.
- **FR-013**: The system MUST show clear, user-friendly error messages for all authentication failures (invalid credentials, duplicate username/email, network errors, server errors).
- **FR-014**: The system MUST prevent authenticated users from accessing the sign-up and login pages.
- **FR-015**: The system MUST provide a password reset flow where users request a reset via email and receive a one-time reset link.
- **FR-016**: The system MUST send the same confirmation response for both existing and non-existing email addresses during password reset requests to prevent email enumeration.
- **FR-017**: The system MUST invalidate password reset links after use or after a defined expiration period.
- **FR-018**: The system MUST provide a password change flow for authenticated users, requiring current password verification before accepting a new password.
- **FR-019**: The system MUST reject password change attempts where the new password matches the current password.
- **FR-020**: The Django backend MUST invalidate all existing sessions (refresh tokens) for a user upon password change or password reset, requiring re-authentication.

### Key Entities _(stored in Django backend — frontend only consumes these via API)_

- **User**: Represents a registered account (Django model). Key attributes: unique identifier, username (unique), email (unique), hashed password, creation timestamp. The frontend receives a `UserDto` (without password hash) from the API.
- **AuthSession**: Represents an active authentication session (managed by Django). Key attributes: user identifier, JWT access token, refresh token, expiration timestamps for both tokens. Access token returned in response body; refresh token returned as HTTP-only cookie.
- **PasswordResetToken**: Represents a pending password reset request (Django model). Key attributes: user identifier, one-time token, expiration timestamp, used flag.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A new user can complete sign-up and reach the main application in under 30 seconds.
- **SC-002**: A returning user can log in and reach the main application in under 15 seconds.
- **SC-003**: Invalid login attempts display a clear error message within 2 seconds of submission.
- **SC-004**: Form validation errors appear inline before submission within 500ms of user input.
- **SC-005**: Protected routes redirect unauthenticated users to login within 1 second of navigation.
- **SC-006**: 100% of protected routes enforce authentication (no unprotected access to restricted content).
- **SC-007**: JWT verification on protected endpoints does not add more than 50ms to request processing time.
- **SC-008**: Users remain authenticated across page reloads and browser restarts for the duration of the refresh token validity.
- **SC-009**: A user can complete password reset (from request to new password set) in under 2 minutes.
- **SC-010**: Password reset emails are sent within 5 seconds of the reset request submission.

## Assumptions

- **A Django backend already exists** and handles all server-side authentication: user storage, password hashing, JWT issuance, JWT verification, refresh token management, and email sending for password reset. The frontend (this project) is a client that calls the Django API — it does NOT implement its own auth server logic.
- The application already has a landing page; the auth pages (sign-up, login, password reset, password change) are new additions to the same application.
- Username, email, and password are the required fields for sign-up. No email verification is required for v1.
- Username must be 3-30 characters, alphanumeric with underscores/hyphens.
- The minimum password length is 8 characters.
- Access tokens expire after 15 minutes. Refresh tokens expire after 7 days.
- Password reset links expire after 1 hour.
- Refresh tokens are stored in an HTTP-only, secure cookie, set by the Django backend. Access tokens are stored in memory (not localStorage).
- Password reset tokens are stored server-side (Django) with a unique token sent via email link (email sending handled by Django backend).
- The auth forms follow the same minimalist design system (white background, black/dark gray actions) established by the landing page.
- Multi-provider authentication (Google, etc.) is out of scope for v1 and will be addressed as a separate feature.
- Rate limiting on authentication endpoints (login, password reset) is handled by the Django backend and out of scope for this specification.
- Browser support targets modern evergreen browsers (Chrome, Firefox, Safari, Edge — latest 2 versions).
- The Django backend API base URL is configurable via an environment variable (e.g., `VITE_API_BASE_URL`).
