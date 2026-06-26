# Data Model: Mafia Game Landing Page

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

All data is static — read-only constants defined in TypeScript files. No persistence, no API, no state management.

## GameRole

Represents a role players can be assigned in a Mafia game. Displayed in the "How to Play" section as visual cards.

```ts
type RoleAlignment = 'town' | 'mafia' | 'neutral'

interface GameRole {
  /** Unique identifier for the role */
  id: string
  /** Display name */
  name: string
  /** Which faction the role belongs to */
  alignment: RoleAlignment
  /** Short description shown on the card */
  description: string
  /** What the role does during the night phase */
  nightAction: string
  /** Lucide icon name for visual representation */
  icon: string
}

// Example values:
// {
//   id: 'detective',
//   name: 'Detective',
//   alignment: 'town',
//   description: 'Investigate one player each night to discover their allegiance.',
//   nightAction: 'Choose a player to investigate — the moderator reveals if they are Mafia or not.',
//   icon: 'search'
// }
```

**Core roles** (minimum set for a complete game explanation):

- **Mafia** (`mafia`): Eliminates townspeople each night. Knows other Mafia members.
- **Townsperson** (`town`): Votes during the day to eliminate suspected Mafia. No night action.
- **Detective** (`town`): Investigates one player per night to learn their alignment.
- **Doctor** (`town`): Protects one player per night from being eliminated.

## GamePhase

Represents a phase in the Mafia game cycle. Displayed in the "Game Mechanics" section.

```ts
interface GamePhase {
  /** Unique identifier */
  id: string
  /** Display name */
  name: string
  /** Order in the game cycle (1-based) */
  order: number
  /** Brief description of what happens */
  description: string
  /** Who acts during this phase */
  activeRoles: string
  /** Lucide icon name */
  icon: string
}

// Values:
// Night Phase (order: 1) — Mafia eliminates, Detective investigates, Doctor protects
// Day Phase (order: 2) — Players discuss, vote to eliminate a suspect
// Voting (order: 3) — Final vote, player eliminated, role revealed
```

## Site Navigation

Implicit structure — no data file needed. Navigation links are hardcoded in `site-header.tsx`:

- Logo/name → scrolls to top (hero)
- How to Play → `#how-to-play`
- Game Mechanics → `#game-mechanics`
- CTA button → `#join`

## Waitlist/CTA State

No data model — the initial implementation uses a static link/button pointing to a waitlist URL (external service or placeholder). The spec assumes the game is not yet launched; when the game goes live, the CTA destination changes to the actual game lobby.
