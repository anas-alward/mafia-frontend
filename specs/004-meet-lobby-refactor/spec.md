# Feature Specification: Meet Lobby Refactor

**Feature Branch**: `004-meet-lobby-refactor`

**Created**: 2026-06-27

**Status**: Draft

**Input**: User description: "refactor this whole app, so no need for dashboard and so on, it is only one main page, it has to main buttons, one that is create an instant meeting with primary colro and another join, with the link, in the middle to primary actions. it is more like google meet, we still need the header for profile, no need for sidebar"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Create Instant Meeting (Priority: P1)

An authenticated user opens the app, sees a clean lobby page with two primary actions, and clicks "Create Instant Meeting." A new room is created immediately and the user is taken directly into the meeting room. No configuration, no forms — one click to start.

**Why this priority**: This is the core action of the app. Every user who opens the app wants to either start or join a meeting. The instant meeting flow is the fastest path to value.

**Independent Test**: Can be fully tested by authenticating, clicking the Create button, and verifying a room is created and the user is navigated to it. Delivers the core meeting creation capability.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the lobby page, **When** they click "Create Instant Meeting," **Then** a new room is created with them as the creator and first member, and they are redirected to the room.
2. **Given** an authenticated user on the lobby page, **When** room creation fails (e.g., server error), **Then** an error message is displayed and they remain on the lobby page.

---

### User Story 2 - Join Meeting via Link (Priority: P2)

An authenticated user has a room link shared by someone else. They paste the link (or room ID) into the join input on the lobby page, click "Join," and are taken into that meeting room.

**Why this priority**: Joining an existing meeting is the second half of the core flow. Without it, only the meeting creator can enter rooms.

**Independent Test**: Can be fully tested by having a valid room link, pasting it into the join input, clicking Join, and verifying the user is added as a member and navigated to the room.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the lobby page, **When** they enter a valid room link and click "Join," **Then** they are added to the room as a member and redirected to the room page.
2. **Given** an authenticated user on the lobby page, **When** they enter an invalid or malformed link and click "Join," **Then** an error message is shown indicating the link is invalid.
3. **Given** an authenticated user on the lobby page, **When** they enter a valid link to a full room and click "Join," **Then** an error message is shown indicating the room is at capacity.

---

### User Story 3 - Header with Profile Access (Priority: P3)

An authenticated user sees a clean header at the top of the lobby page and room pages, showing the app branding and a profile avatar. Clicking the avatar opens a dropdown with their account details, change password, and logout options.

**Why this priority**: The header provides consistent navigation and account access. It is essential for user trust and session management.

**Independent Test**: Can be fully tested by authenticating, verifying the header is present with the user's avatar, opening the dropdown, and confirming all options work.

**Acceptance Scenarios**:

1. **Given** an authenticated user on any page, **When** the page loads, **Then** a header is visible with the app name and their profile avatar.
2. **Given** an authenticated user viewing the header, **When** they click their avatar, **Then** a dropdown appears showing their username, email, a Change Password option, and a Log Out option.
3. **Given** an authenticated user with the profile dropdown open, **When** they click "Log Out," **Then** their session is cleared and they are redirected to the landing page.

---

### Edge Cases

- What happens when an unauthenticated user tries to access the lobby? They are redirected to the login page.
- What happens when the server is unreachable during room creation? A clear error message is shown, and the user can retry.
- What happens when a user pastes a full URL instead of just the room ID? The system extracts the room ID from the URL.
- What happens when the join input is empty and the user clicks Join? The button is disabled or a validation message appears.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST present a single lobby page after authentication with two primary actions: Create Instant Meeting and Join Meeting.
- **FR-002**: System MUST create a new room and add the creator as a member when "Create Instant Meeting" is clicked.
- **FR-003**: System MUST accept a room link or room ID in a text input for joining.
- **FR-004**: System MUST validate the join input and display appropriate errors for invalid links, full rooms, and non-existent rooms.
- **FR-005**: System MUST extract room identifiers from full URLs when users paste a complete room link.
- **FR-006**: System MUST display a header on all authenticated pages with app branding and a profile avatar dropdown.
- **FR-007**: System MUST remove the sidebar navigation and dashboard page.
- **FR-008**: System MUST redirect authenticated users to the lobby page as the default landing page instead of a dashboard.
- **FR-009**: System MUST preserve existing room management API endpoints (create room, join room via member add) for the lobby to consume.
- **FR-010**: System MUST support clipboard paste for the join link input.

### Key Entities _(include if feature involves data)_

- **Room**: An existing entity representing a meeting room, with a unique ID, name, member count, and maximum capacity. Used by both Create and Join flows.
- **User**: An existing authenticated entity with a unique ID, username, and email. Displayed in the profile header.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A user can create a meeting and enter the room in under 3 seconds from clicking the button.
- **SC-002**: A user can join an existing meeting via link in under 5 seconds from pasting the link.
- **SC-003**: 100% of invalid join links produce a clear, actionable error message rather than a generic failure.
- **SC-004**: Users can access profile options (change password, logout) from any authenticated page without navigating away.

## Clarifications

### Session 2026-06-27

- Q: Should the lobby use a new `features/lobby/` module or reuse the existing `features/rooms/` module? → A: Reuse the existing `features/rooms/` module directly. No new feature module needed.
- Q: After creating or joining a room, where does the user land? → A: The room detail page (`/rooms/$roomId`) is kept as the meeting room destination — the Google Meet-style call screen where WebRTC video will happen. Remove the room management UI (table, create/edit forms, member management dialogs) but keep the room page itself.

## Assumptions

- The existing authentication system (JWT with silent refresh) is preserved and reused as-is.
- The existing room management API endpoints (create room, add member) remain available and unchanged.
- The room detail page (`/rooms/$roomId`) is preserved as the meeting room — the Google Meet-style destination where users land after creating or joining. This is where WebRTC video calls will later be integrated.
- Room creation for "instant meeting" uses default values (auto-generated name, default max members) without requiring user input.
- The header design from the previous implementation (avatar dropdown, profile) is preserved and adapted to remove the sidebar dependency.
- The lobby page replaces the dashboard as the default authenticated route (`/` or `/lobby`).
- Users have stable internet connectivity for real-time room creation and joining.
