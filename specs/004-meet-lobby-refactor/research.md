# Research: Meet Lobby Refactor

## 1. URL Parsing for Join Links

**Decision**: Use a simple regex to extract room IDs from both full URLs and raw room IDs.

**Rationale**: Users may paste a full URL like `https://app.example.com/rooms/abc123` or just a room ID like `abc123`. A regex extracts the last path segment from a URL, and if the input doesn't match a URL pattern, treat the raw input as the room ID. No external library needed — this is ~5 lines of code.

**Alternatives considered**:
- URL constructor: Would fail on raw room IDs, requiring a try/catch fallback. Same result but more verbose.
- Library (e.g., `uri-js`): Unnecessary dependency for a single regex operation.

## 2. Instant Room Creation

**Decision**: Call the existing `createRoom` API with auto-generated defaults — name: `"Meeting <timestamp>"`, max_members: 25. The user is added as creator automatically by the backend.

**Rationale**: The existing `POST /rooms/create/` endpoint already exists and works. We just need to pass sensible defaults. No backend changes required. The timestamp in the name ensures uniqueness.

**Alternatives considered**:
- Dedicated `/rooms/instant/` endpoint: Would require backend changes. Overkill for a default wrapper.
- Random adjective-noun names: Nice UX but adds complexity. Simple timestamp names are clear and sortable.

## 3. Authenticated Layout Without Sidebar

**Decision**: Replace the `SidebarProvider` + `SidebarInset` layout with a simple `div` layout: header at top, main content below. The `SidebarTrigger` and `Sidebar` components are removed entirely. The header retains the profile avatar dropdown from the previous implementation.

**Rationale**: No sidebar means no need for `SidebarProvider`, `SidebarInset`, or the sidebar state machine. A plain flex column layout is simpler and matches the Google Meet pattern.

**Alternatives considered**:
- Keep `SidebarProvider` with collapsed sidebar: Pointless overhead. The sidebar state machine, cookie, and keyboard shortcut add complexity for no value.
- Inline header in the lobby route: Would duplicate header code between lobby and any future authenticated pages. A layout route is cleaner.

## 4. URL Extraction Regex

**Decision**: `/\/([^/]+)\/?$/` on the pathname, or match the full URL pattern `/rooms/([^/]+)`.

**Rationale**: Room IDs are UUIDs (36 chars, hex + hyphens). The regex `/[a-f0-9-]{32,36}/i` matches UUIDs directly. Simpler: just grab whatever comes after `/rooms/` in a URL, or treat the whole input as the room ID if no `/rooms/` pattern is found.

**Implementation**:
```ts
function extractRoomId(input: string): string {
  // If it looks like a URL with /rooms/<id>, extract the ID
  const match = input.match(/\/rooms\/([^/?\s]+)/)
  if (match) return match[1]
  // Otherwise treat the whole trimmed input as the room ID
  return input.trim()
}
```

This handles:
- `https://app.com/rooms/abc-123` → `abc-123`
- `/rooms/abc-123` → `abc-123`
- `abc-123` → `abc-123`
- `https://app.com/rooms/abc-123?foo=bar` → `abc-123` (query params stripped)

## 5. Room API Client Preservation

**Decision**: Keep `src/features/rooms/api/client.ts` and `src/features/rooms/types.ts` for the `createRoom` and `addMember` (join) API functions. Delete the query hooks for listing rooms, getting room details, and listing members — the lobby only needs create and join.

**Rationale**: The lobby only calls two API operations: create a room and join a room. Keeping the full query hook set would leave dead code. The raw API functions (`createRoom`, `addMember`) are still needed by the lobby's mutation hooks.

**Simplification**: The lobby feature will have its own `useCreateMeeting` and `useJoinMeeting` hooks that wrap the room API functions. This keeps the lobby self-contained and the rooms feature minimal.

## 6. Default Values for Instant Meeting

**Decision**:
- `name`: `"Instant Meeting"` — simple, clear, predictable
- `description`: `undefined` — not needed
- `max_members`: `25` — reasonable default for a game of Mafia

**Rationale**: Google Meet uses "Instant Meeting" as the default. No need to reinvent this. The max of 25 accommodates a standard Mafia game (typically 7-15 players) with headroom.
