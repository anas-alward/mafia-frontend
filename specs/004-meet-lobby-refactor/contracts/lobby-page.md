# Lobby Page Contract

## Route

- **Path**: `/lobby`
- **Auth**: Required (redirects to `/login` if unauthenticated)
- **Layout**: Wrapped in `_authenticated` layout route

## Page Structure

```
┌─────────────────────────────────────────────────────┐
│  [Mafia]                          [👤 Profile] │  ← Header
├─────────────────────────────────────────────────────┤
│                                                     │
│                                                     │
│                    [Mafia Logo]                      │
│                                                     │
│              What would you like to do?              │
│                                                     │
│    ┌──────────────────────┐                         │
│    │  🎥  Create Instant   │   ← Primary button     │
│    │     Meeting           │                         │
│    └──────────────────────┘                         │
│                                                     │
│                    — or —                            │
│                                                     │
│    ┌──────────────────────────────┐ ┌────────┐     │
│    │  Paste a link or room code   │ │  Join  │     │
│    └──────────────────────────────┘ └────────┘     │
│                                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Components

### CreateMeetingButton

- Renders a prominent button with primary styling
- On click: calls `POST /rooms/create/` with default values
- On success: navigates to `/rooms/:roomId`
- On error: displays inline error message
- States: idle, loading (spinner + "Creating..."), error

### JoinMeetingForm

- Renders a text input + Join button in a horizontal group
- Input accepts: full URL (`https://.../rooms/:id`), path (`/rooms/:id`), or raw room ID
- Extracts room ID from URL before submitting
- On submit: calls `POST /rooms/:roomId/members/` with `{ user_id: currentUser.id }`
- On success: navigates to `/rooms/:roomId`
- On error: displays contextual error (invalid link, room full, server error)
- States: idle, loading, error (per error type), success (redirect)
- Empty input: Join button is disabled

## Error States

| Scenario | User Message |
|----------|-------------|
| Invalid/malformed link | "Invalid room link. Please check the link and try again." |
| Room not found (404) | "Room not found. It may have been deleted." |
| Room is full (400) | "This room is full. Maximum capacity reached." |
| Server unreachable | "Unable to connect. Please check your internet and try again." |
| Room creation failed | "Failed to create meeting. Please try again." |

## API Calls

| Action | Endpoint | Method | Body |
|--------|----------|--------|------|
| Create meeting | `/rooms/create/` | POST | `{ name: "Instant Meeting", max_members: 25 }` |
| Join meeting | `/rooms/:roomId/members/` | POST | `{ user_id: "<current-user-id>" }` |

Both calls use the existing JWT auth interceptor (`src/lib/api-client.ts`).
