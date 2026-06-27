# Implementation Plan: Room Management

**Branch**: `room-management` | **Date**: 2026-06-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-room-management/spec.md`

## Summary

Implement room management (CRUD) with member management for the Mafia game platform. Users can browse rooms in a table, create rooms with name/description/max-members, view room details including member list, edit room settings (creator only), add/remove members, and share room links. The feature follows the established project pattern: `src/features/rooms/` with Zod schemas, Zustand store, TanStack Query for server state, shadcn/ui components, and file-based routes under `_authenticated/rooms/`.

## Technical Context

**Language/Version**: TypeScript 6.0, React 19.2

**Primary Dependencies**: TanStack Start (router, SSR), TanStack Query (server state), shadcn/ui (radix), zod 4, zustand, react-hook-form

**Storage**: Django backend (PostgreSQL) — all room/member data managed by Django REST API; frontend consumes via REST endpoints

**Testing**: Vitest + @testing-library/react

**Target Platform**: Cloudflare Workers (nodejs_compat) — frontend SSR only

**Project Type**: Frontend web application (SSR React on Workers) consuming a Django REST API backend

**Performance Goals**: Room list loads <3s, room detail loads <2s, form submissions <1s

**Constraints**: JWT auth required for all room endpoints; Django backend provides REST API; HTTP-only cookies for refresh tokens

**Scale/Scope**: v1 small scale (hundreds of rooms, dozens of members per room), 5 routes (list, detail, create, edit, member management)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle | Status | Notes |
|---|---|---|
| I. Simplicity over Cleverness | ✅ Pass | Standard CRUD patterns; no over-engineered abstractions |
| II. Explicit over Implicit | ✅ Pass | Room state explicitly managed; API calls clearly named; auth checks visible |
| III. Readability over Brevity | ✅ Pass | Feature broken into small, focused modules (api, schemas, store, components) |
| IV. Type Safety over Convenience | ✅ Pass | Zod schemas → inferred types; no `any`; DTOs mapped to domain types |
| V. Server-First | ✅ Pass | Data fetching via TanStack Query on server; client components only for interactive forms/modals |
| VI. Composition over Inheritance | ✅ Pass | Features composed as modules; no class hierarchies |
| VII. Convention over Configuration | ✅ Pass | Follows `features/rooms/` pattern established by `features/auth/` |
| VIII. Performance is a Feature | ✅ Pass | Room list cached via TanStack Query; member lists loaded on demand; no unnecessary re-renders |
| IX. Security is Never Optional | ✅ Pass | Auth gate on `_authenticated` route; creator-only edit enforcement; input validation via Zod |
| X. Consistency over Personal Preference | ✅ Pass | Same directory structure, naming, and component patterns as existing features |

## Project Structure

### Documentation (this feature)

```text
specs/003-room-management/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── features/
│   └── rooms/
│       ├── api/
│       │   └── client.ts          # Room API endpoint functions
│       ├── schemas/
│       │   └── room.ts            # Zod validation schemas
│       ├── store/
│       │   └── room-store.ts      # Zustand store (UI state: modals, selected room)
│       ├── components/
│       │   ├── rooms-table.tsx     # Room list table
│       │   ├── room-create-form.tsx
│       │   ├── room-edit-form.tsx
│       │   ├── room-detail.tsx
│       │   ├── member-list.tsx
│       │   ├── add-member-dialog.tsx
│       │   └── share-link-button.tsx
│       └── types.ts               # Room domain types
├── routes/
│   └── _authenticated/
│       ├── rooms.tsx               # /rooms — table list (existing, needs update)
│       ├── rooms/
│       │   ├── $roomId.tsx         # /rooms/$roomId — detail page
│       │   ├── $roomId.edit.tsx    # /rooms/$roomId/edit — edit form
│       │   └── new.tsx             # /rooms/new — create form
├── lib/
│   └── api-client.ts              # Shared fetch wrapper (exists)
└── components/
    └── ui/                         # shadcn/ui primitives (exist)
```

**Structure Decision**: Single frontend project following the established `features/rooms/` pattern. Routes are file-based via TanStack Router under `_authenticated/rooms/`. API calls delegate to Django REST backend via the shared `lib/api-client.ts` fetch wrapper.

## Complexity Tracking

> No violations. All constitution principles pass.
