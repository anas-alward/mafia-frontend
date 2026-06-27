# Research: Room Management

**Feature**: 003-room-management
**Date**: 2026-06-27

## 1. Route Structure for Room CRUD

**Decision**: Flat routes under `_authenticated/rooms/` with path parameters for room identity.

**Rationale**: TanStack Router file-based routing supports `$roomId` path params natively. Splitting create (new.tsx) from detail ($roomId.tsx) from edit ($roomId.edit.tsx) keeps each route thin — consistent with the project constitution's route rules.

**Alternatives considered**:
- Nested layout route (`_authenticated/rooms/_layout/`) — adds unnecessary nesting for this scope; no shared layout beyond what `_authenticated` already provides.
- Query-param modals (e.g., `?modal=edit`) — obscures URLs, breaks direct linking, harder to reason about.

**Routes**:
| File | URL | Purpose |
|---|---|---|
| `rooms.tsx` | `/rooms` | Room list table |
| `rooms/new.tsx` | `/rooms/new` | Create room form |
| `rooms/$roomId.tsx` | `/rooms/:roomId` | Room detail + members |
| `rooms/$roomId.edit.tsx` | `/rooms/:roomId/edit` | Edit room form |

## 2. State Management Strategy

**Decision**: TanStack Query for server state (rooms list, room detail, members); Zustand only for ephemeral UI state (dialog open/close, selected member).

**Rationale**: TanStack Query is already in the project (via `@tanstack/react-query`). It handles caching, invalidation, refetching, and loading/error states automatically. Using it avoids duplicating server state in Zustand, which the constitution explicitly warns against ("Never duplicate state").

**Alternatives considered**:
- Zustand-only — would require manual cache invalidation and refetch logic, duplicating what TanStack Query provides.
- URL state for everything — overkill for server-persisted data; URL params best for filter/sort state.

**Store responsibilities**:
- **TanStack Query**: `useRoomsList()`, `useRoom(id)`, `useRoomMembers(id)` — server data with caching
- **Zustand** (`room-store.ts`): `isCreateModalOpen`, `isEditModalOpen`, `isAddMemberOpen` — UI-only state

## 3. Room CRUD API Design

**Decision**: REST endpoints on the existing Django backend. The frontend calls these via the shared `request<T>()` wrapper in `lib/api-client.ts`.

**Rationale**: The Django backend already exists and the auth feature (002-jwt-authentication) established the pattern of `src/features/<name>/api/client.ts` with typed endpoint functions. Consistency across features is a constitution requirement.

**Expected endpoints** (Django side, consumed by frontend):
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/rooms/` | List all rooms |
| `POST` | `/api/rooms/` | Create room |
| `GET` | `/api/rooms/:id/` | Room detail |
| `PUT`/`PATCH` | `/api/rooms/:id/` | Update room |
| `DELETE` | `/api/rooms/:id/` | Delete room |
| `GET` | `/api/rooms/:id/members/` | List members |
| `POST` | `/api/rooms/:id/members/` | Add member |
| `DELETE` | `/api/rooms/:id/members/:userId/` | Remove member |

## 4. Member Management Approach

**Decision**: Member list shown on room detail page. Add member via dialog/modal with user search/selection. Remove member via button on each member row (creator only).

**Rationale**: Inline member management on the detail page avoids extra navigation. A dialog for adding keeps the detail page uncluttered. Creator-only remove aligns with the spec's authorization model (FR-007).

**Alternatives considered**:
- Separate `/rooms/:id/members` page — adds navigation friction for a simple list operation.
- Invite-based system (generate invite codes) — unnecessary complexity for v1; implies email infrastructure not in scope.

## 5. Share Link Feature

**Decision**: A "Share" button on the room detail page copies the room URL (`/rooms/:roomId`) to clipboard. Uses the Web Clipboard API with a fallback to `document.execCommand('copy')`.

**Rationale**: Simple, zero-dependency approach. The room URL is already the natural share target. No backend changes needed — the link is just the frontend route.

**Alternatives considered**:
- Generate a unique share/invite code — adds backend complexity with no v1 benefit. A copiable URL achieves the same UX goal.
- Web Share API — good for mobile but not universally supported; Clipboard API is more reliable across browsers.

## 6. Form Validation Pattern

**Decision**: Reuse the established pattern from `features/auth/`: Zod schemas in `schemas/room.ts` with `@hookform/resolvers` for react-hook-form integration, and shadcn/ui `Form` components.

**Rationale**: This pattern is already proven in the codebase. Type inference from Zod schemas eliminates type duplication. shadcn/ui Form components provide consistent error display.

**Schemas needed**:
- `createRoomSchema`: name (1-100 chars), description (optional, max 500), maxMembers (2-50, integer)
- `updateRoomSchema`: same as create but all fields optional (partial update)
- `addMemberSchema`: userId (required string)
