# Start Game Tooltip — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace pre-game tile-clicking selection with a tooltip anchored above the Start Game button, listing all live RealtimeKit participants with checkboxes.

**Architecture:** A new `StartGameTooltip` component renders inside a portal, positioned above the Play button in `ControlBar`. `live.tsx` no longer owns pre-game selection state — it lives inside the tooltip. `TilesGrid` drops all pre-game selection props since tiles are no longer clickable pre-game. In-game tile actions are untouched.

**Tech Stack:** React, RealtimeKit, Tailwind CSS v4, Lucide React

## Global Constraints

- All in-game tile actions (vote, kill, heal, detect, shoot, revenge, roleblock, silent) remain unchanged
- `LiveParticipantTile` keeps its `isSelectable`/`isSelected` props (still used for in-game targets)
- 6 player minimum to start a game
- Styling uses `var(--game-*)` CSS custom properties

---

### Task 1: Create `StartGameTooltip` component

**Files:**
- Create: `src/features/rooms/components/live/start-game-tooltip.tsx`

**Interfaces:**
- Consumes: RealtimeKit participant objects (shape: `{ customParticipantId: unknown, name: string }`)
- Produces: `<StartGameTooltip anchorRef participants onStartGame isOpen onClose />`

```typescript
interface StartGameTooltipProps {
  anchorRef: React.RefObject<HTMLElement | null>
  participants: Array<{ customParticipantId: unknown; name: string }>
  onStartGame: (playerIds: number[]) => void
  isOpen: boolean
  onClose: () => void
}
```

- [ ] **Step 1: Write the component**

```tsx
// src/features/rooms/components/live/start-game-tooltip.tsx
import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Play, Check } from 'lucide-react'

interface RtkParticipant {
  customParticipantId?: unknown
  name?: string
}

interface StartGameTooltipProps {
  anchorRef: React.RefObject<HTMLElement | null>
  participants: RtkParticipant[]
  onStartGame: (playerIds: number[]) => void
  isOpen: boolean
  onClose: () => void
}

export default function StartGameTooltip({
  anchorRef,
  participants,
  onStartGame,
  isOpen,
  onClose,
}: StartGameTooltipProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Reset selection when tooltip opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set())
    }
  }, [isOpen])

  // Calculate position above the anchor button
  useEffect(() => {
    if (!isOpen || !anchorRef.current) return
    const recalc = () => {
      const rect = anchorRef.current!.getBoundingClientRect()
      setPosition({
        top: rect.top - 8, // gap above button
        left: rect.left + rect.width / 2, // center of button
      })
    }
    recalc()
    window.addEventListener('resize', recalc)
    return () => window.removeEventListener('resize', recalc)
  }, [isOpen, anchorRef])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Close on outside click (skip the button that opens it)
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      const isInsideTooltip = tooltipRef.current?.contains(target)
      const isOnAnchor = anchorRef.current?.contains(target)
      if (!isInsideTooltip && !isOnAnchor) {
        onClose()
      }
    }
    const timeout = setTimeout(() => {
      document.addEventListener('mousedown', handler)
    }, 0)
    return () => {
      clearTimeout(timeout)
      document.removeEventListener('mousedown', handler)
    }
  }, [isOpen, onClose, anchorRef])

  const toggleParticipant = useCallback((userId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) {
        next.delete(userId)
      } else {
        next.add(userId)
      }
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    const allIds = new Set(
      participants
        .map((p) => {
          const id = Number(p.customParticipantId)
          return Number.isNaN(id) ? null : id
        })
        .filter((id): id is number => id != null),
    )
    setSelectedIds(allIds)
  }, [participants])

  const handleStart = () => {
    const playerIds = Array.from(selectedIds)
    if (playerIds.length >= 6) {
      onStartGame(playerIds)
      onClose()
    }
  }

  if (!isOpen) return null

  const playerList = participants
    .map((p) => {
      const id = Number(p.customParticipantId)
      return { id, name: p.name ?? 'Unknown', valid: !Number.isNaN(id) }
    })
    .filter((p) => p.valid)

  const count = selectedIds.size
  const canStart = count >= 6

  return createPortal(
    <div
      ref={tooltipRef}
      className="fixed z-50 w-56 rounded-xl border shadow-2xl overflow-hidden"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translate(-50%, -100%)',
        backgroundColor: 'var(--game-bg-elevated)',
        borderColor: 'var(--game-border)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}
    >
      {/* Arrow pointing down at the button */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full"
        style={{
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: `6px solid var(--game-bg-elevated)`,
        }}
      />

      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 border-b"
        style={{ borderColor: 'var(--game-border)' }}
      >
        <span
          className="text-xs font-semibold"
          style={{ color: 'var(--game-text-primary)' }}
        >
          Select Players
        </span>
        <button
          type="button"
          onClick={selectAll}
          className="text-xs font-medium transition-opacity cursor-pointer hover:opacity-80"
          style={{ color: 'var(--game-periwinkle)' }}
        >
          Select All
        </button>
      </div>

      {/* Participant list */}
      <div
        className="max-h-48 overflow-y-auto"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--game-border) transparent',
        }}
      >
        {playerList.map((p) => {
          const isSelected = selectedIds.has(p.id)
          const initial = p.name.charAt(0).toUpperCase()
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggleParticipant(p.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2 transition-colors cursor-pointer hover:bg-white/[0.03]"
              style={{
                backgroundColor: isSelected
                  ? 'rgba(237, 184, 58, 0.06)'
                  : 'transparent',
              }}
            >
              {/* Checkbox */}
              <div
                className="h-4 w-4 rounded border flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: isSelected
                    ? 'var(--game-gold)'
                    : 'transparent',
                  borderColor: isSelected
                    ? 'var(--game-gold)'
                    : 'rgba(243, 240, 232, 0.25)',
                }}
              >
                {isSelected && <Check className="h-3 w-3 text-black" />}
              </div>

              {/* Avatar initial */}
              <div
                className="h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
                style={{
                  backgroundColor: 'rgba(243, 240, 232, 0.08)',
                  color: 'var(--game-text-primary)',
                }}
              >
                {initial}
              </div>

              {/* Name */}
              <span
                className="text-xs truncate"
                style={{ color: 'var(--game-text-primary)' }}
              >
                {p.name}
              </span>
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <div
        className="px-3 py-2.5 border-t"
        style={{ borderColor: 'var(--game-border)' }}
      >
        <button
          type="button"
          disabled={!canStart}
          onClick={handleStart}
          className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            canStart ? 'cursor-pointer' : 'cursor-not-allowed'
          }`}
          style={{
            color: canStart ? '#000' : 'var(--game-text-muted)',
            backgroundColor: canStart
              ? 'var(--game-gold)'
              : 'rgba(243, 240, 232, 0.06)',
          }}
        >
          <Play className="h-3.5 w-3.5" />
          Start Game ({count}/6)
        </button>
      </div>
    </div>,
    document.body,
  )
}
```

- [ ] **Step 2: Verify file compiles**

```bash
bun --bun run build 2>&1 | head -20
```
Expected: no TypeScript errors related to the new file.

---

### Task 2: Integrate tooltip into `ControlBar`, wire participants

**Files:**
- Modify: `src/features/rooms/components/live/control-bar.tsx`

**Interfaces:**
- Consumes: `StartGameTooltip` component from Task 1, `useRealtimeKitMeeting`, `useRealtimeKitSelector`
- Produces: Updated `ControlBar` with tooltip state and participant list

- [ ] **Step 1: Add imports, state, and participant data**

Replace the top of `control-bar.tsx` — add the import for `StartGameTooltip` and the RealtimeKit hooks (if not already imported), add tooltip open state and participant list.

The file already imports `useRealtimeKitMeeting` and `useRealtimeKitSelector` at lines 5-7. Add the new import after the existing local imports (after line 26):

```tsx
import StartGameTooltip from '#/features/rooms/components/live/start-game-tooltip'
```

- [ ] **Step 2: Add tooltip state and participant data inside the component**

After the existing state declarations (around line 76, after `const [isFullscreen, setIsFullscreen] = useState(false)`), add:

```tsx
const [showStartTooltip, setShowStartTooltip] = useState(false)
const startBtnRef = useRef<HTMLButtonElement>(null)
const { meeting } = useRealtimeKitMeeting()
const allParticipants = useRealtimeKitSelector(() => {
  const remotes = meeting.participants.joined.toArray()
  return [meeting.self, ...remotes]
})
```

Note: `meeting` is already destructured at line 42. We need to move it up or reuse. Check the existing code — it's already `const { meeting } = useRealtimeKitMeeting()` at line 42. Good.

- [ ] **Step 3: Add `useRef` import**

The existing imports at line 1 already include `useEffect, useCallback, useMemo`. Add `useRef`:

```tsx
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
```

- [ ] **Step 4: Replace the pre-game Start Game button (lines 124-146)**

Replace:

```tsx
{/* Start Game (pre-game host) */}
{!gameStarted && isPreGameHost && (
  <button
    type="button"
    disabled={!canStart}
    onClick={() => {
      const playerIds = Array.from(preGameSelectedIds).map(Number)
      if (playerIds.length >= 6) onStartGame(playerIds)
    }}
    title={`Start Game (${totalPlayers}/6)`}
    className={`${orbBase} ${canStart ? 'cursor-pointer' : 'cursor-not-allowed'}`}
    style={{
      color: canStart ? 'var(--game-gold)' : 'var(--game-text-muted)',
      backgroundColor: canStart
        ? 'rgba(237, 184, 58, 0.1)'
        : 'transparent',
      borderColor: canStart
        ? 'rgba(237, 184, 58, 0.3)'
        : 'var(--game-border)',
    }}
  >
    <Play className="h-4 w-4" />
  </button>
)}
```

With:

```tsx
{/* Start Game (pre-game host) */}
{!gameStarted && isPreGameHost && (
  <>
    <button
      ref={startBtnRef}
      type="button"
      onClick={() => setShowStartTooltip((prev) => !prev)}
      title="Start Game"
      className={`${orbBase} cursor-pointer`}
      style={{
        color: 'var(--game-gold)',
        backgroundColor: 'rgba(237, 184, 58, 0.1)',
        borderColor: 'rgba(237, 184, 58, 0.3)',
      }}
    >
      <Play className="h-4 w-4" />
    </button>
    <StartGameTooltip
      anchorRef={startBtnRef}
      participants={allParticipants}
      onStartGame={onStartGame}
      isOpen={showStartTooltip}
      onClose={() => setShowStartTooltip(false)}
    />
  </>
)}
```

- [ ] **Step 5: Remove pre-game-selection derived values**

Remove these lines (73-74):

```tsx
const totalPlayers = preGameSelectedIds.size
const canStart = totalPlayers >= 6
```

---

### Task 3: Remove pre-game selection from `TilesGrid`

**Files:**
- Modify: `src/features/rooms/components/live/tiles-grid.tsx`

**Interfaces:**
- Remove: `preGameSelectedIds`, `onTogglePreGamePlayer`, `isPreGameHost` props
- `TilesGrid` no longer receives any selection-related props — it just renders tiles

- [ ] **Step 1: Update the component props and tile rendering**

Replace the entire file content:

```tsx
import {
  useRealtimeKitMeeting,
  useRealtimeKitSelector,
} from '@cloudflare/realtimekit-react'
import LiveParticipantTile from '#/features/rooms/components/live/participant-tile'

export function getColumns(count: number) {
  if (count <= 1) return 1
  if (count === 2) return 2
  if (count <= 4) return 2
  if (count <= 9) return 3
  return 4
}

export default function TilesGrid() {
  const { meeting } = useRealtimeKitMeeting()

  const localParticipant = useRealtimeKitSelector(() => meeting.self)
  const remoteParticipants = useRealtimeKitSelector(() =>
    meeting.participants.joined.toArray(),
  )
  // Only remote participants in the grid — self is rendered as a corner tile
  const localUserId = (localParticipant as any).customParticipantId as
    | string
    | undefined
  const allParticipants = remoteParticipants.filter(
    (p) =>
      (p as any).customParticipantId !== localUserId || localUserId == null,
  )
  const cols = getColumns(allParticipants.length)
  const rows = Math.ceil(allParticipants.length / cols)
  const pad = '1.5rem'
  const gap = '0.75rem'
  const itemW = `calc((100% - ${pad} - (${cols} - 1) * ${gap}) / ${cols})`
  const itemH = `calc((100% - ${pad} - (${rows} - 1) * ${gap}) / ${rows})`

  return (
    <div className="flex flex-wrap content-center justify-center h-full w-full gap-3 p-4">
      {allParticipants.map((participant) => {
        return (
          <div
            key={participant.id || participant.userId || 'participant-tile'}
            style={{ width: itemW, height: itemH }}
          >
            <LiveParticipantTile
              participant={participant}
              isSelected={false}
              isSelectable={false}
              onSelect={() => {}}
            />
          </div>
        )
      })}
    </div>
  )
}
```

Key changes:
- No props at all — component is self-contained
- `isSelected` is always `false`, `isSelectable` is always `false`, `onSelect` is a no-op
- No `isPreGameHost` logic, no `onTogglePreGamePlayer`, no `preGameSelectedIds`

---

### Task 4: Remove pre-game selection from `live.tsx`

**Files:**
- Modify: `src/routes/rooms/$roomId/live.tsx`

**Interfaces:**
- Remove: `preGameSelectedIds`, `onTogglePreGamePlayer`, `isPreGameHost`, `selfSelectable`, `selfSelected`
- Remove: pre-game selection props from `TilesGrid`, `LiveParticipantTile`, `ControlBar`

- [ ] **Step 1: Remove state and derived values (lines 116-141)**

Remove lines 116-141 (the `preGameSelectedIds` state, `onTogglePreGamePlayer` callback, `isPreGameHost`, `selfSelectable`, `selfSelected`). The entire block:

```tsx
const [preGameSelectedIds, setPreGameSelectedIds] = useState<Set<number>>(
  new Set(),
)

const onTogglePreGamePlayer = useCallback((userId: number) => {
  setPreGameSelectedIds((prev) => {
    const next = new Set(prev)
    if (next.has(userId)) {
      next.delete(userId)
    } else {
      next.add(userId)
    }
    return next
  })
}, [])

const currentUserId = currentUser ? Number(currentUser.id) : null
const isPreGameHost = isHost && !gameStarted

let selfSelectable = false
let selfSelected = false
if (isPreGameHost) {
  selfSelectable = true
  selfSelected =
    currentUserId != null && preGameSelectedIds.has(currentUserId)
}
```

Replace with just:

```tsx
const currentUserId = currentUser ? Number(currentUser.id) : null
const isPreGameHost = isHost && !gameStarted
```

- [ ] **Step 2: Update `TilesGrid` usage (line 154-158)**

Replace:

```tsx
<TilesGrid
  preGameSelectedIds={preGameSelectedIds}
  onTogglePreGamePlayer={onTogglePreGamePlayer}
  isPreGameHost={isPreGameHost}
/>
```

With:

```tsx
<TilesGrid />
```

- [ ] **Step 3: Update the self `LiveParticipantTile` (lines 162-167)**

Replace:

```tsx
<LiveParticipantTile
  participant={selfParticipant}
  isSelected={selfSelected}
  isSelectable={selfSelectable}
  onSelect={isPreGameHost ? onTogglePreGamePlayer : () => {}}
/>
```

With:

```tsx
<LiveParticipantTile
  participant={selfParticipant}
  isSelected={false}
  isSelectable={false}
  onSelect={() => {}}
/>
```

- [ ] **Step 4: Update `ControlBar` usage (lines 171-176)**

Replace:

```tsx
<ControlBar
  fullScreenRef={fullScreenRef}
  isPreGameHost={isPreGameHost}
  preGameSelectedIds={preGameSelectedIds}
  onStartGame={startGame}
/>
```

With:

```tsx
<ControlBar
  fullScreenRef={fullScreenRef}
  isPreGameHost={isPreGameHost}
  onStartGame={startGame}
/>
```

---

### Task 5: Update `control-bar.tsx` props interface

**Files:**
- Modify: `src/features/rooms/components/live/control-bar.tsx` (lines 29-33)

**Interfaces:**
- Remove: `preGameSelectedIds` from `ControlBarProps`

- [ ] **Step 1: Simplify the props interface**

Replace:

```tsx
interface ControlBarProps {
  fullScreenRef: React.RefObject<HTMLDivElement | null>
  isPreGameHost: boolean
  preGameSelectedIds: Set<number>
  onStartGame: (playerIds: number[]) => void
}
```

With:

```tsx
interface ControlBarProps {
  fullScreenRef: React.RefObject<HTMLDivElement | null>
  isPreGameHost: boolean
  onStartGame: (playerIds: number[]) => void
}
```

- [ ] **Step 2: Update destructured props (lines 36-41)**

Replace:

```tsx
export default function ControlBar({
  fullScreenRef,
  isPreGameHost,
  preGameSelectedIds,
  onStartGame,
}: ControlBarProps) {
```

With:

```tsx
export default function ControlBar({
  fullScreenRef,
  isPreGameHost,
  onStartGame,
}: ControlBarProps) {
```

---

### Task 6: Clean up unused `game-action-bar.tsx` pre-game logic

**Files:**
- Modify: `src/features/game/components/game-action-bar.tsx`

**Interfaces:**
- Remove: `preGameSelectedIds` and `onStartGame` from `GameActionBarProps`
- Remove: pre-game Start Game button section

- [ ] **Step 1: Remove pre-game props from interface (lines 83-88)**

Replace:

```tsx
interface GameActionBarProps {
  selectedPlayerId: number | null
  preGameSelectedIds: Set<number>
  isPreGameHost: boolean
  onStartGame: (playerIds: number[]) => void
}
```

With:

```tsx
interface GameActionBarProps {
  selectedPlayerId: number | null
}
```

- [ ] **Step 2: Remove destructured pre-game props (lines 90-95)**

Replace:

```tsx
export default function GameActionBar({
  selectedPlayerId,
  preGameSelectedIds,
  isPreGameHost,
  onStartGame,
}: GameActionBarProps) {
```

With:

```tsx
export default function GameActionBar({
  selectedPlayerId,
}: GameActionBarProps) {
```

- [ ] **Step 3: Remove pre-game derived values and Start Game button (lines 120-185)**

Remove these lines:

```tsx
const totalPlayers = preGameSelectedIds.size
const canStart = totalPlayers >= 6
```

And remove the entire pre-game block (lines 160-185):

```tsx
{/* Pre-game: Start Game (host only) */}
{!gameStarted && isPreGameHost && (
  <button ...>
    <Play className="h-4 w-4" />
  </button>
)}
```

- [ ] **Step 4: Remove unused imports**

Remove `Play` from the `lucide-react` import at line 12, and `useGameStore` if no longer needed (line 18 — still needed for game state). Check: `useGameStore` is still used (line 96-112). `Play` was used in the pre-game button — remove it from the import.

---

### Task 7: Build and verify

**Files:**
- All modified files from Tasks 1-6

- [ ] **Step 1: Type-check**

```bash
bun --bun run build 2>&1 | tail -30
```
Expected: no TypeScript errors.

- [ ] **Step 2: Run tests**

```bash
bun --bun run test
```
Expected: all existing tests pass.

- [ ] **Step 3: Run linter**

```bash
bun --bun run lint
```
Expected: no new lint errors.
