# Tasks: Meet Lobby Refactor

**Input**: Design documents from `/specs/004-meet-lobby-refactor/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/lobby-page.md, quickstart.md

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks grouped by user story for independent implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Create lobby route directory, no heavy tooling changes needed

- [X] T001 [P] Create lobby route at `src/routes/_authenticated/lobby.tsx` with a placeholder component
- [X] T002 [P] Add join meeting validation schema to `src/features/rooms/schemas/room.ts` (URL or raw room ID extraction)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Remove sidebar from authenticated layout — required before ANY user story page renders correctly

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Modify authenticated layout in `src/routes/_authenticated/route.tsx` — remove SidebarProvider, AppSidebar, SidebarInset; replace with plain `<div>` layout; keep header with profile dropdown
- [X] T004 [P] Update root index route in `src/routes/index.tsx` to redirect authenticated users to `/lobby` instead of `/dashboard`
- [X] T005 [P] Add `/lobby` page title to header page-titles map in `src/routes/_authenticated/route.tsx`

**Checkpoint**: App renders without sidebar, authenticated users land on lobby, header with profile works

---

## Phase 3: User Story 1 - Create Instant Meeting (Priority: P1) 🎯 MVP

**Goal**: Authenticated user sees lobby with a "Create Instant Meeting" button; clicking it creates a room and navigates to the meeting room

**Independent Test**: Authenticate, click "Create Instant Meeting" button on lobby, verify room is created and user is navigated to `/rooms/:roomId`

### Implementation for User Story 1

- [X] T006 [US1] Implement CreateMeetingButton component in `src/features/rooms/components/create-meeting-button.tsx` — calls `createRoom()` with defaults (`name: "Instant Meeting"`, `max_members: 25`), shows loading state, navigates to `/rooms/$roomId` on success, shows error on failure
- [X] T007 [US1] Wire CreateMeetingButton into lobby route at `src/routes/_authenticated/lobby.tsx` — center the button on page with Mafia branding and subtitle

**Checkpoint**: User Story 1 fully functional — one-click room creation from lobby

---

## Phase 4: User Story 2 - Join Meeting via Link (Priority: P2)

**Goal**: User pastes a room link or room ID into the join input, clicks Join, is added as member and navigated to the meeting room

**Independent Test**: With a valid room ID/link, paste it into join input, click Join, verify user is added and navigated to `/rooms/:roomId`

### Implementation for User Story 2

- [X] T008 [US2] Implement JoinMeetingForm component in `src/features/rooms/components/join-meeting-form.tsx` — text input + Join button, URL extraction from pasted links (regex from research.md), calls `addMember()`, validates room ID is not empty, shows contextual errors (invalid link, room full, not found), disables button when input is empty
- [X] T009 [US2] Add JoinMeetingForm to lobby route in `src/routes/_authenticated/lobby.tsx` — place below CreateMeetingButton with "or" divider

**Checkpoint**: User Stories 1 AND 2 both work — full lobby flow (create + join)

---

## Phase 5: User Story 3 - Header with Profile Access (Priority: P3)

**Goal**: Header shows app name and profile avatar dropdown; clicking avatar reveals username, email, Change Password, Log Out

**Independent Test**: Verify header is visible on lobby and meeting room pages, avatar dropdown works with all options

### Implementation for User Story 3

- [X] T010 [US3] Verify and clean up header profile dropdown in `src/routes/_authenticated/route.tsx` — ensure Avatar, DropdownMenu with username/email display, Change Password link, and Log Out all work after sidebar removal

**Checkpoint**: All 3 user stories functional — full app works: lobby with create/join + header with profile

---

## Phase 6: Polish & Cleanup

**Purpose**: Remove all unused files from the old dashboard + rooms management UI

- [X] T011 Delete sidebar component at `src/components/app-sidebar.tsx`
- [X] T012 [P] Delete dashboard route at `src/routes/_authenticated/dashboard.tsx`
- [X] T013 [P] Delete rooms list route at `src/routes/_authenticated/rooms.tsx`
- [X] T014 [P] Delete room create form route at `src/routes/_authenticated/rooms/new.tsx`
- [X] T015 [P] Delete room edit form route at `src/routes/_authenticated/rooms/$roomId.edit.tsx`
- [X] T016 [P] Delete rooms UI components: `rooms-table.tsx`, `room-create-form.tsx`, `room-edit-form.tsx`, `room-detail.tsx`, `member-list.tsx`, `add-member-dialog.tsx`, `share-link-button.tsx` from `src/features/rooms/components/`
- [X] T017 Delete rooms UI store at `src/features/rooms/store/room-store.ts`
- [X] T018 Strip unused query hooks from `src/features/rooms/api/client.ts` — keep only `createRoom`, `addMember`, `getRoom` raw API functions and their mutation hooks; remove `listRooms`, `useRoomsList`, `useRoom`, `updateRoom`, `deleteRoom`, `listMembers`, `useRoomMembers`, `useCreateRoom` (replaced by simpler mutation in create-meeting-button), `useUpdateRoom`, `useDeleteRoom`, `useAddMember` (replaced by simpler mutation in join-meeting-form), `useRemoveMember`
- [X] T019 Simplify meeting room page at `src/routes/_authenticated/rooms/$roomId.tsx` — keep room name, member count, share link; remove edit button, member management, room detail card content
- [X] T020 Run lint (`bun run lint`) and TypeScript check (`npx tsc --noEmit`); fix any errors
- [X] T021 Validate against quickstart.md — run through all 9 validation scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational
- **US2 (Phase 4)**: Depends on US1 (modifies same lobby route file)
- **US3 (Phase 5)**: Depends on Foundational — can run in parallel with US1
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — no dependencies on other stories
- **US2 (P2)**: Depends on US1 (both modify lobby.tsx) — sequential
- **US3 (P3)**: Can start after Foundational — independent of US1/US2

### Parallel Opportunities

- T001 and T002 can run in parallel (Phase 1)
- T004 and T005 can run in parallel (Phase 2, after T003)
- T012-T016 can all run in parallel (Phase 6 — different files to delete)
- US3 (T010) can run in parallel with US1 (T006-T007)

---

## Parallel Example: Phase 1 Setup

```bash
# Launch both setup tasks in parallel:
Task: "Create lobby route at src/routes/_authenticated/lobby.tsx"
Task: "Add join meeting validation schema to src/features/rooms/schemas/room.ts"
```

## Parallel Example: Phase 6 Cleanup

```bash
# Launch all deletion tasks in parallel:
Task: "Delete rooms list route at src/routes/_authenticated/rooms.tsx"
Task: "Delete room create form route at src/routes/_authenticated/rooms/new.tsx"
Task: "Delete room edit form route at src/routes/_authenticated/rooms/$roomId.edit.tsx"
Task: "Delete rooms UI components from src/features/rooms/components/"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T005)
3. Complete Phase 3: User Story 1 (T006-T007)
4. **STOP and VALIDATE**: Click "Create Instant Meeting" — verify room creation and navigation
5. Demo if ready — user can create meetings

### Incremental Delivery

1. Setup + Foundational → Sidebar removed, lobby placeholder exists
2. Add US1 → Create Instant Meeting works → MVP!
3. Add US2 → Join Meeting works → Full lobby
4. Add US3 → Header profile polished
5. Polish → Delete dead code, lint, validate

---

## Notes

- No new feature module — lobby imports directly from `features/rooms/`
- Room detail page (`$roomId.tsx`) is kept as the meeting room destination
- Default instant meeting values: name `"Instant Meeting"`, max_members `25`
- URL extraction regex: `/\/rooms\/([^/?\s]+)/` then fall back to trimmed input
- Header profile dropdown already exists from prior implementation — just needs sidebar removal verification
