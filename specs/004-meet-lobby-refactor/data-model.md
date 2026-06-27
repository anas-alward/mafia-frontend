# Data Model: Meet Lobby Refactor

All entities are pre-existing from the room management feature. The lobby consumes them without modification.

## Room

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `id` | `string` (UUID) | API | Primary identifier, used in join links |
| `name` | `string` | API | Auto-generated for instant meetings: `"Instant Meeting"` |
| `description` | `string \| null` | API | Unused in lobby flow |
| `maxMembers` | `number` | API | Default 25 for instant meetings |
| `memberCount` | `number` | API | Checked before join to enforce capacity |
| `creator` | `{ id: string; username: string }` | API | Set to the authenticated user on creation |
| `createdAt` | `string` (ISO 8601) | API | Displayed in room detail (preserved page) |
| `updatedAt` | `string` (ISO 8601) | API | Not displayed in lobby |

**Domain type** (camelCase): `Room` in `src/features/rooms/types.ts`
**Transport type** (snake_case): `RoomDto` in `src/features/rooms/types.ts`

## User

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `id` | `string` (UUID) | Auth store | Used to identify the creator |
| `username` | `string` | Auth store | Displayed in header profile dropdown |
| `email` | `string` | Auth store | Displayed in header profile dropdown |

## Lobby UI State (new)

| Field | Type | Notes |
|-------|------|--------|
| `joinLink` | `string` | Controlled input value in JoinMeetingForm |
| `isJoining` | `boolean` | Loading state during join mutation |
| `joinError` | `string \| null` | Error message from failed join attempt |
| `isCreating` | `boolean` | Loading state during create mutation |
| `createError` | `string \| null` | Error message from failed create attempt |

UI state is local to the lobby component (React state or hook form), not persisted.
