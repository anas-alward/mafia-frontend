# Data Model: Room Management

**Feature**: 003-room-management
**Date**: 2026-06-27

## Domain Types

### Room

Core entity representing a game room for Mafia sessions.

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| `id` | `string` (UUID) | ✅ | — | Unique room identifier |
| `name` | `string` | ✅ | 1-100 chars | Display name shown in room list and detail |
| `description` | `string` | ❌ | 0-500 chars | Optional room description |
| `maxMembers` | `number` | ✅ | 2-50, integer | Maximum number of members allowed |
| `memberCount` | `number` | ✅ | computed | Current number of members (denormalized for list display) |
| `creator` | `User` | ✅ | — | The user who created the room (from auth feature) |
| `videoCallUrl` | `string` | ❌ | valid URL | Placeholder for future video integration |
| `createdAt` | `string` (ISO 8601) | ✅ | — | Timestamp of room creation |
| `updatedAt` | `string` (ISO 8601) | ✅ | — | Timestamp of last update |

### RoomMember

Represents a user's membership in a room.

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| `userId` | `string` (UUID) | ✅ | — | Reference to User entity |
| `username` | `string` | ✅ | — | Denormalized for display (from User) |
| `roomId` | `string` (UUID) | ✅ | — | Reference to Room entity |
| `joinedAt` | `string` (ISO 8601) | ✅ | — | When the user joined |

### User (reference)

Imported from `features/auth/types.ts`. Key fields used by rooms: `id`, `username`.

## Relationships

```
Room 1 ──── * RoomMember * ──── 1 User
     │                                │
     └── creator (FK to User) ────────┘
```

## API DTOs (Transport Layer)

### RoomDto (from API)

```ts
interface RoomDto {
  id: string
  name: string
  description: string | null
  max_members: number
  member_count: number
  creator: {
    id: string
    username: string
  }
  video_call_url: string | null
  created_at: string
  updated_at: string
}
```

### RoomMemberDto (from API)

```ts
interface RoomMemberDto {
  user_id: string
  username: string
  room_id: string
  joined_at: string
}
```

### CreateRoomRequest

```ts
interface CreateRoomRequest {
  name: string
  description?: string
  max_members: number
}
```

### UpdateRoomRequest

```ts
interface UpdateRoomRequest {
  name?: string
  description?: string
  max_members?: number
}
```

### AddMemberRequest

```ts
interface AddMemberRequest {
  user_id: string
}
```

## Mapping Convention

DTOs use `snake_case` (Django convention). Domain types use `camelCase` (TypeScript convention). A mapper function transforms between them at the API client boundary.

```ts
function mapRoomDto(dto: RoomDto): Room {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    maxMembers: dto.max_members,
    memberCount: dto.member_count,
    creator: dto.creator,
    videoCallUrl: dto.video_call_url,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  }
}
```

## Validation Schemas (Zod)

```ts
const createRoomSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  maxMembers: z.number().int().min(2, 'Must allow at least 2 members').max(50, 'Maximum 50 members'),
})

const updateRoomSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  maxMembers: z.number().int().min(2).max(50).optional(),
})

const addMemberSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
})
```

## State Transitions

Rooms have no complex lifecycle state in v1. A room exists once created and is removed when deleted. Members transition between two states:

```
[Not a Member] ── add ──→ [Member] ── remove ──→ [Not a Member]
```

The `maxMembers` constraint gates the add transition: add is rejected if `memberCount >= maxMembers`.
