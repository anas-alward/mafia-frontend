# Start Game Tooltip

**Date:** 2026-08-11
**Status:** approved

## Problem

Currently, the host selects participants for a game by clicking participant tiles directly in the grid. For "Start Game," this is confusing — tiles serve dual purpose (selection + in-game actions). Selection should happen in a dedicated tooltip anchored to the Start Game button itself.

## Design

### Start Game Tooltip Component

A compact tooltip anchored above the Play/Start Game button. Opens when the host clicks the button.

**Layout:**
- Positioned above the Start Game button, arrow pointing down
- Dark background (`var(--game-bg-elevated)`), border (`var(--game-border)`)
- Each row: checkbox + avatar initial circle + display name
- "Select All" button at top of list
- "Start Game" button at bottom, disabled until 6+ selected, shows count (e.g., "Start Game (7/10)")
- Closes on: clicking outside, pressing Escape, or clicking "Start Game"

**State:**
- All checkboxes start unselected
- Selection state lives inside the tooltip component (no longer in `live.tsx`)
- Participants list comes from RealtimeKit meeting participants (remote + self)

### Changes to Existing Files

**`live.tsx`:**
- Remove `preGameSelectedIds` state and `onTogglePreGamePlayer` callback
- Remove `isPreGameHost`, `selfSelectable`, `selfSelected` derived values
- Stop passing pre-game selection props to `TilesGrid` and the self `LiveParticipantTile`
- Import and pass participant list to `ControlBar` for the tooltip

**`TilesGrid`:**
- Remove `preGameSelectedIds`, `onTogglePreGamePlayer`, `isPreGameHost` props
- Stop computing `isSelectable`, `isSelected` for pre-game selection
- Tiles are no longer clickable/selectable in pre-game

**`ControlBar`:**
- Accept participant list prop
- Render the Start Game tooltip component anchored to the Play button

**`game-action-bar.tsx`:**
- Same changes as ControlBar — accept participant list, render tooltip

### Unchanged

- All in-game tile actions: vote, kill, heal, detect, shoot, revenge, roleblock, silent
- Tile hover overlays with action orbs
- Role icons, lynch target styling, dead overlays, vote badges, speaking glow
- The `LiveParticipantTile` component's `isSelectable`/`isSelected` props remain (they're still used for in-game target selection)

### New Component

`src/features/rooms/components/live/start-game-tooltip.tsx`:

```
Props:
  participants: RealtimeKit participant array
  onStartGame: (playerIds: number[]) => void
  isOpen: boolean
  onClose: () => void
  anchorRef: React.RefObject<HTMLElement>
```

Uses a portal to render above the anchor button, with click-outside and Escape handling.
