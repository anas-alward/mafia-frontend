# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun install
bun --bun run dev              # Start dev server on port 3000
bun --bun run build            # Production build
bun --bun run test             # Run Vitest suite
bun --bun run lint             # ESLint
bun --bun run format           # Prettier + ESLint fix
bun --bun run check            # Prettier check only
pnpm dlx shadcn@latest add <component>  # Add shadcn/ui components
```

## Architecture

### Feature pattern (`src/features/`)

Each feature is a self-contained module with its own components, hooks, API client, types, schemas, and state components:

```
features/<name>/
  api/client.ts       # Endpoint functions built on shared request() from lib/api-client.ts
  components/          # Feature-specific UI components
  context/             # React Context providers
  hooks/               # Custom hooks for data/state
  schemas/             # Zod validation schemas
  states/              # State-driven UI components (one per state)
  types.ts             # Domain types + DTO types + mappers (snake_case DTO → camelCase domain)
  events.ts            # Typed WebSocket message interfaces (discriminated union on `type`)
  store/               # Zustand stores (auth only — room/game state uses Context)
```

### Context composition in routes

Route layouts act as data-composition layers — they call hooks and assemble context values so child routes only consume:

1. **Layout route** (`$roomId/route.tsx`): Calls `useRoomWebSocket`, `useRoomState`, `useGameState`, `useGameActions`, assembles the return values into `MeetingContextValue` and `GameContextValue`, and wraps `<Outlet />` in both providers.
2. **Child routes** (`join.tsx`, `live.tsx`): Import only `useMeetingContext()` / `useGameContext()` — they never call the raw hooks directly.

This keeps data-fetching in one layer and presentation in another.

### State-driven rendering

Each feature's `states/` directory contains one component per possible state (e.g., `meeting-setup-state`, `room-active-state`, `room-closed-state`, `room-connecting-state`). Routes or parent components switch between them based on data conditions. State components receive all data as props — they do not fetch.

### API client layering

- `src/lib/api-client.ts` — Shared `request<T>()` wrapper with JWT `Authorization` header, automatic token refresh on 401 (with dedup lock), and `credentials: 'include'` for httpOnly cookies.
- Feature `api/client.ts` — Thin endpoint functions (`getRoom`, `createRoom`, etc.) that call `request()` with typed generics.

### WebSocket event system

`src/features/rooms/events.ts` defines typed interfaces for every WebSocket message in both directions. All messages use a `type` discriminant field. The `WsMessage` union type powers `useRoomWebsocket` → `useRoomState` / `useGameState` pattern-matching via `switch (lastMessage.type)`.

### Auth

Zustand store (`features/auth/store/auth-store.ts`) with `zustand/middleware/persist` to localStorage under key `mafia-auth`. The root route (`__root.tsx`) checks auth in `beforeLoad` and redirects unauthenticated users to `/login`. `SessionInit` component handles silent token refresh on page load.

### DTO mapping

Backend returns snake_case JSON (`max_members`, `host_id`). Domain types use camelCase (`maxMembers`, `hostId`). Each feature's `types.ts` exports a mapper function (e.g., `mapRoomDto`) that converts at the API boundary.

### Tech stack

- **Framework**: TanStack Start (SSR on Cloudflare Workers)
- **Router**: TanStack Router (file-based, `src/routes/`)
- **Styling**: Tailwind CSS v4, shadcn/ui (new-york style, zinc base), `tw-animate-css`
- **State**: Zustand (auth), React Context (room/meeting/game)
- **Data**: TanStack Query, WebSocket (native), RealtimeKit (WebRTC/meetings)
- **Validation**: Zod v4
- **Icons**: Lucide React
- **Env**: `@t3-oss/env-core` — client vars prefixed with `VITE_`

### Import aliases

Both `#/*` and `@/*` map to `src/*`. Prefer `#/*` for all imports.
