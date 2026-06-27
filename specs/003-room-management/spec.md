# Feature Specification: Room Management

**Feature Branch**: `room-management`

**Created**: 2026-06-27

**Status**: Draft

**Input**: User description: "we want room management (video call), in the pages of rooms you display a table with the rooms, and each room have members and name and max numbers and all these details are in the room detail or when you create a room, in the form, you can update some stuff about the room later"

## User Scenarios & Testing

### User Story 1 - Browse and View Rooms (Priority: P1)

Authenticated users can see a table of all rooms on the Rooms page. Each row shows the room name, current member count, and maximum capacity. Clicking a room navigates to its detail page where all room information is displayed.

**Why this priority**: Without visibility into available rooms, no other room interactions are possible. This is the entry point for all room-related activity.

**Independent Test**: Navigate to `/rooms`, see a table listing all rooms. Click a room to see its full details on a dedicated page.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the Rooms page, **When** the page loads, **Then** a table displays all existing rooms with name, member count, and max capacity columns.
2. **Given** no rooms exist, **When** the Rooms page loads, **Then** an empty state message is shown with a prompt to create the first room.
3. **Given** a user viewing the rooms table, **When** they click on a room row, **Then** they navigate to that room's detail page showing all room information (name, description, members list, max capacity, creator).

---

### User Story 2 - Create a Room (Priority: P2)

An authenticated user can create a new room by filling out a form with the room name, optional description, and maximum number of members. Upon creation, they are redirected to the new room's detail page.

**Why this priority**: Creating rooms is the core action that populates the rooms list. Without it, users can only view an empty table.

**Independent Test**: Click "Create Room", fill out the form, submit, and be redirected to the new room's detail page.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the Rooms page, **When** they click "Create Room", **Then** a form is displayed with fields for name, description, and max members.
2. **Given** the create room form is filled with valid data, **When** the user submits, **Then** the room is created and they are redirected to the room detail page.
3. **Given** the create room form is submitted with invalid data, **When** validation fails, **Then** field-level errors are displayed below each invalid input.

---

### User Story 3 - Update Room Settings (Priority: P3)

The room creator can edit room settings (name, description, max members) from the room detail page. Changes take effect immediately.

**Why this priority**: Updating improves flexibility but isn't required for basic room usage. A room can function with its initial settings.

**Independent Test**: As the room creator, navigate to room detail, click edit, change the name, submit, and see the updated name reflected.

**Acceptance Scenarios**:

1. **Given** the room creator viewing the room detail page, **When** they click "Edit Room", **Then** an edit form is displayed pre-filled with current values.
2. **Given** the edit form is submitted with valid changes, **When** the request succeeds, **Then** the detail page reflects the updated information.
3. **Given** a user who is NOT the room creator, **When** they view the room detail page, **Then** no edit option is available.

---

### Edge Cases

- What happens when a room reaches its maximum capacity? New members cannot join; a clear message indicates the room is full.
- What happens when the room creator deletes their account? Room ownership transfers or the room becomes ownerless and cannot be edited.
- How does the system handle concurrent room creation with the same name? Room names are not unique; rooms are identified by ID.

## Requirements

### Functional Requirements

- **FR-001**: System MUST display a table of all rooms on the Rooms page with columns for name, member count, and max capacity.
- **FR-002**: System MUST show an empty state when no rooms exist, prompting the user to create one.
- **FR-003**: System MUST provide a room detail page showing name, description, members list, max capacity, and creator.
- **FR-004**: System MUST allow authenticated users to create a room with a name, optional description, and maximum member count.
- **FR-005**: System MUST validate room creation inputs: name is required (1-100 characters), max members is required (2-50, integer).
- **FR-006**: System MUST allow the room creator to update the room's name, description, and max member count.
- **FR-007**: System MUST prevent non-creator users from editing room settings.
- **FR-008**: System MUST allow rooms to have a video call link associated with them; actual video call integration is deferred to a separate feature out of scope for this specification.
- **FR-009**: System MUST require authentication for all room management actions (view, create, update).

### Key Entities

- **Room**: Represents a game room where users gather for Mafia games via video call. Key attributes: name, description, maxMembers, memberCount, creator, createdAt, updatedAt.
- **RoomMember**: Represents a user's membership in a room. Links a User to a Room with a joinedAt timestamp.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can view the rooms list and navigate to a room detail page in under 3 seconds.
- **SC-002**: Users can create a room in under 1 minute from landing on the Rooms page.
- **SC-003**: Room creator can update room settings and see changes reflected immediately.
- **SC-004**: 100% of room management actions are behind authentication.

## Assumptions

- All users are authenticated before accessing room features (reuses the existing JWT authentication system from 002-jwt-authentication).
- The Django backend provides REST API endpoints for room CRUD operations.
- Video call functionality will be clarified during planning — it may be an embedded third-party provider, an external link, or deferred to a separate feature.
- Room membership management (join/leave/kick) may be addressed in a future iteration; this spec focuses on room CRUD.
- The sidebar navigation already has a Rooms link pointing to `/rooms`.
- Form patterns (react-hook-form + shadcn Form components + API error handling) are established and will be reused.
- Video call integration is out of scope for this feature; the room may store a video call URL as a placeholder for future integration.
