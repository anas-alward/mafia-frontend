# Tasks: Room Management

**Input**: Design documents from `/specs/003-room-management/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/room-api.md

**Tests**: Not requested in feature specification. No test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Frontend only: `src/` at repository root
- Route files: `src/routes/_authenticated/rooms/`
- Feature modules: `src/features/rooms/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the feature directory structure for rooms

- [x] T001 Create `src/features/rooms/` directory structure with subdirectories: `api/`, `schemas/`, `store/`, `components/`
- [x] T002 Create `src/routes/_authenticated/rooms/` directory for nested room routes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core room types, API client, schemas, and store that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Define Room and RoomMember domain types + DTOs + mapper functions in `src/features/rooms/types.ts`
- [x] T004 [P] Implement room API endpoint functions (list, detail, create, update, delete) in `src/features/rooms/api/client.ts` using shared `request<T>()` from `src/lib/api-client.ts`
- [x] T005 [P] Implement member API endpoint functions (list, add, remove) in `src/features/rooms/api/client.ts`
- [x] T006 [P] Define Zod validation schemas (createRoomSchema, updateRoomSchema, addMemberSchema) in `src/features/rooms/schemas/room.ts`
- [x] T007 Create Zustand UI state store (createModalOpen, editModalOpen, addMemberOpen, selectedRoomId) in `src/features/rooms/store/room-store.ts`
- [x] T008 [P] Define TanStack Query keys and query hooks (useRoomsList, useRoom, useRoomMembers) in `src/features/rooms/api/client.ts`

**Checkpoint**: Foundation ready — all user story implementation can now begin

---

## Phase 3: User Story 1 - Browse and View Rooms (Priority: P1)

**Goal**: Authenticated users can see a table of all rooms and view room details including member list and shareable link

**Independent Test**: Navigate to `/rooms`, see table with rooms. Click a room, see detail page with name, description, members, creator, and share button

### Implementation for User Story 1

- [x] T009 [P] [US1] Build rooms table component displaying name, member count, max capacity, and created date in `src/features/rooms/components/rooms-table.tsx`
- [x] T010 [P] [US1] Build room detail component showing all room info (name, description, creator, member count, max capacity, timestamps) in `src/features/rooms/components/room-detail.tsx`
- [x] T011 [P] [US1] Build member list component showing all members with usernames and join dates in `src/features/rooms/components/member-list.tsx`
- [x] T012 [P] [US1] Build share link button that copies room URL (`/rooms/:id`) to clipboard in `src/features/rooms/components/share-link-button.tsx`
- [x] T013 [US1] Update `/rooms` route at `src/routes/_authenticated/rooms.tsx` to fetch and render the rooms table with empty state handling
- [x] T014 [US1] Create `/rooms/$roomId` route at `src/routes/_authenticated/rooms/$roomId.tsx` rendering room detail, member list, and share button
- [x] T015 [US1] Add room row click navigation from table to detail page in `src/features/rooms/components/rooms-table.tsx`

**Checkpoint**: Users can browse rooms in a table and view a full room detail page with members and share link

---

## Phase 4: User Story 2 - Create a Room (Priority: P2)

**Purpose**: Authenticated users can create rooms with name, description, and max members

**Independent Test**: Click "Create Room", fill form, submit, get redirected to new room detail page

### Implementation for User Story 2

- [x] T016 [P] [US2] Build room create form component with react-hook-form + shadcn Form (name, description, maxMembers fields) in `src/features/rooms/components/room-create-form.tsx`
- [x] T017 [US2] Create `/rooms/new` route at `src/routes/_authenticated/rooms/new.tsx` rendering the create form
- [x] T018 [US2] Wire form submission to `createRoom` API call, on success redirect to `/rooms/$roomId` in `src/features/rooms/components/room-create-form.tsx`
- [x] T019 [US2] Add "Create Room" button to the rooms table empty state and table header in `src/features/rooms/components/rooms-table.tsx`

**Checkpoint**: Users can create rooms and are redirected to the new room's detail page

---

## Phase 5: User Story 3 - Member Management & Room Editing (Priority: P3)

**Purpose**: Room creator can add/remove members and edit room settings; non-creators see no edit controls

**Independent Test**: As creator, add a member, remove a member, edit room name; as non-creator, verify no edit options appear

### Implementation for User Story 3

- [x] T020 [P] [US3] Build add member dialog component with user search/selection in `src/features/rooms/components/add-member-dialog.tsx`
- [x] T021 [P] [US3] Build room edit form component pre-filled with current values (name, description, maxMembers) in `src/features/rooms/components/room-edit-form.tsx`
- [x] T022 [US3] Create `/rooms/$roomId/edit` route at `src/routes/_authenticated/rooms/$roomId.edit.tsx` rendering the edit form
- [x] T023 [US3] Add "Edit Room" button to room detail page, visible only to room creator, in `src/features/rooms/components/room-detail.tsx`
- [x] T024 [US3] Add "Add Member" button to member list section, visible only to room creator, in `src/features/rooms/components/member-list.tsx`
- [x] T025 [US3] Add member remove button per member row, visible only to room creator, with confirmation, in `src/features/rooms/components/member-list.tsx`
- [x] T026 [US3] Enforce max_members constraint: disable "Add Member" and show "Room full" message when `memberCount >= maxMembers` in `src/features/rooms/components/member-list.tsx`
- [x] T027 [US3] Invalidate TanStack Query cache after create/update/delete mutations so room list and detail stay in sync in `src/features/rooms/api/client.ts`

**Checkpoint**: Full CRUD + member management works; creator-only controls enforced

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and quality checks

- [x] T028 Run quickstart.md validation scenarios (all 10 scenarios) and fix any issues
- [x] T029 Run `bun run lint` and `bun run check` — fix any warnings or errors
- [x] T030 [P] Verify empty states: no rooms, no members, room at max capacity
- [x] T031 [P] Verify auth gate: unauthenticated access to `/rooms` redirects to `/login`
- [x] T032 [P] Verify share link copies correct URL to clipboard

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2)
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2), integrates with US1 route
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2), extends US1 components
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependencies on other stories
- **US2 (P2)**: Can start after Phase 2 — independent of US1 but adds "Create Room" button to rooms table
- **US3 (P3)**: Can start after Phase 2 — extends US1 detail page with edit/member controls

### Within Each User Story

- Components before routes (components are imported by routes)
- Parent route before child routes
- UI components can be built in parallel if on different files

### Parallel Opportunities

- **Phase 2**: All 6 tasks (T003-T008) marked [P] can run in parallel
- **Phase 3 (US1)**: T009-T012 (all components) can run in parallel; T013-T014 routes after components
- **Phase 4 (US2)**: T016 is independent of other US2 tasks
- **Phase 5 (US3)**: T020-T021 can run in parallel (different files)
- **Phase 6**: T030-T032 all run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all US1 components in parallel:
Task: "Build rooms table component in src/features/rooms/components/rooms-table.tsx"
Task: "Build room detail component in src/features/rooms/components/room-detail.tsx"
Task: "Build member list component in src/features/rooms/components/member-list.tsx"
Task: "Build share link button in src/features/rooms/components/share-link-button.tsx"

# After components complete, launch routes:
Task: "Update /rooms route in src/routes/_authenticated/rooms.tsx"
Task: "Create /rooms/$roomId route in src/routes/_authenticated/rooms/$roomId.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T008) — **CRITICAL**
3. Complete Phase 3: User Story 1 (T009-T015)
4. **STOP and VALIDATE**: Test browse rooms and view detail independently
5. Deploy/demo if ready — users can see rooms and details

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Browse Rooms) → Test independently → **MVP!** (rooms table + detail + share link)
3. Add US2 (Create Room) → Test independently → Users can create rooms
4. Add US3 (Edit + Members) → Test independently → Full CRUD + member management
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (T009-T015)
   - Developer B: User Story 2 (T016-T019)
   - Developer C: User Story 3 (T020-T027)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- The "rooms" sidebar link already exists in `src/components/app-sidebar.tsx`
- All API calls go through the shared `request<T>()` in `src/lib/api-client.ts`
- TanStack Query `useMutation` handles cache invalidation after create/update/delete
