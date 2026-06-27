# Implementation Plan: Meet Lobby Refactor

**Branch**: `room-management` | **Date**: 2026-06-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-meet-lobby-refactor/spec.md`

## Summary

Refactor the authenticated app from a multi-page dashboard with sidebar and room management into a single-page Google Meet-style lobby. The lobby has two primary actions: "Create Instant Meeting" (one-click room creation) and "Join" (paste a link/room code to join). Remove the sidebar, dashboard, rooms table, room forms, and member management UI. Keep the header with profile dropdown. Preserve the existing auth system and room API client for create/join operations.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)

**Primary Dependencies**: TanStack Start (SSR framework), TanStack Router (file-based routing), TanStack Query (server state), React 19, Zustand (auth store with persist), react-hook-form + zod (join form validation), shadcn/ui (UI primitives), Tailwind CSS v4

**Storage**: N/A — Django REST API backend consumed via `src/lib/api-client.ts`

**Testing**: N/A — no test framework configured in project

**Target Platform**: Cloudflare Workers (SSR) + Browser (client hydration)

**Project Type**: Web application (SSR SPA frontend consuming REST API)

**Performance Goals**: Lobby page renders in <500ms; room creation round-trip <3s; join round-trip <5s

**Constraints**: Must preserve existing JWT auth flow (access + refresh tokens, silent refresh on 401). Room API endpoints unchanged.

**Scale/Scope**: Single lobby page replacing 6 authenticated routes. ~10 files to delete, ~3 files to modify, ~1 new component.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity over Cleverness | ✅ PASS | Removing sidebar, dashboard, and rooms management drastically simplifies the app |
| II. Explicit over Implicit | ✅ PASS | Lobby has exactly two explicit actions — Create and Join |
| III. Readability over Brevity | ✅ PASS | Single-page layout is inherently readable |
| IV. Type Safety over Convenience | ✅ PASS | Existing DTO/domain type separation preserved; zod validation on join input |
| V. Server-First | ✅ PASS | Lobby is an SSR route; client interactivity limited to button clicks |
| VI. Composition over Inheritance | ✅ PASS | Lobby composes header + two action cards |
| VII. Convention over Configuration | ✅ PASS | Follows existing features/ pattern and file-based routing |
| VIII. Performance is a Feature | ✅ PASS | Removing unused routes/pages reduces bundle size |
| IX. Security is Never Optional | ✅ PASS | Auth guard preserved; room API calls use existing JWT interceptor |
| X. Consistency over Personal Preference | ✅ PASS | Follows existing naming, directory structure, and component patterns |

**Gate result**: ALL PASS — proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/004-meet-lobby-refactor/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── routes/
│   ├── __root.tsx                    # UNCHANGED
│   ├── _authenticated/
│   │   ├── route.tsx                 # MODIFIED: remove sidebar, simplify header
│   │   ├── lobby.tsx                 # NEW: lobby page with Create + Join actions
│   │   ├── rooms/                    # PARTIAL: keep $roomId.tsx (meeting room), delete rooms.tsx, new.tsx, $roomId.edit.tsx
│   │   └── dashboard.tsx             # DELETED
│   ├── index.tsx                     # MODIFIED: redirect authenticated users to /lobby
│   └── ... (auth routes unchanged)
├── components/
│   ├── app-sidebar.tsx               # DELETED
│   └── ui/                           # UNCHANGED (sidebar.tsx kept but unused)
├── features/
│   ├── auth/                         # UNCHANGED
│   ├── landing/                      # UNCHANGED
│   └── rooms/                        # PARTIAL: keep api/client.ts, types.ts, schemas/; delete components/, store/
└── lib/
    └── api-client.ts                 # UNCHANGED
```

**Structure Decision**: Single web application project. No new feature module — the lobby route at `src/routes/_authenticated/lobby.tsx` directly imports from `features/rooms/` for API functions, types, and validation schemas. The rooms feature is stripped of all UI components and the UI state store, keeping only the API client, types, and schemas. Routes are simplified from 6 authenticated routes to 3 (layout + lobby + meeting room).

## Complexity Tracking

> No violations — all constitution gates pass.
