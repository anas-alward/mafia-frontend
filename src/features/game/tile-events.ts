import type { LucideIcon } from 'lucide-react'
import { ShieldCheck, Skull, User } from 'lucide-react'
import type { GameLogEntry, GameStatePlayer } from '#/features/game/events'
import { ACTION_REGISTRY } from '#/features/game/constants/actions'

/**
 * Resolve the display name of a signal's actor. Empty-string names (stale
 * room members) must fall through to the next source, hence `||` not `??`.
 */
export function resolveActorName(
  actorId: number | null,
  gamePlayers: GameStatePlayer[],
  participants: { userId: number; username: string }[],
): string | undefined {
  if (actorId == null) return undefined
  return (
    gamePlayers.find((p) => p.id === actorId)?.name ||
    participants.find((p) => p.userId === actorId)?.username ||
    `Player ${actorId}`
  )
}

// ── Tile event visuals ──
// Keyed by the backend `action_type` string. Add a new entry here to support a
// new event — `deriveTileEvents` emits an event for any log action_type that
// has a matching visual.

export interface TileEventVisual {
  icon: LucideIcon
  accent: string
  bg: string
  message: string
}

// A visual can be static, or a function of the event's roleType (the detective's
// result differs for a mafia vs town target).
export type TileEventVisualResolver =
  | TileEventVisual
  | ((roleType?: string) => TileEventVisual)

const CRIMSON = 'var(--game-crimson)'
const MINT = 'var(--game-mint)'

// Action types that represent a player being eliminated.
const DEATH_ACTIONS = new Set(['kill', 'died', 'shoot', 'revenge', 'lynch'])

const SAVED: TileEventVisual = {
  icon: ShieldCheck,
  accent: MINT,
  bg: 'rgba(77, 232, 160, 0.24)',
  message: 'Saved',
}

// Action visuals derive from ACTION_REGISTRY (constants/actions) — the single
// source of truth for action presentation.
const ACTION_EVENT_VISUALS = Object.fromEntries(
  Object.entries(ACTION_REGISTRY).map(([type, def]) => [
    type,
    {
      icon: def.eventIcon,
      accent: def.color,
      bg: def.bg,
      message: def.eventMessage,
    },
  ]),
) as Partial<Record<string, TileEventVisual>>

export const TILE_EVENT_VISUALS: Partial<
  Record<string, TileEventVisualResolver>
> = {
  ...ACTION_EVENT_VISUALS,
  died: ACTION_EVENT_VISUALS.kill,
  saved: SAVED,
  investigate: (roleType) =>
    roleType === 'mafia'
      ? {
          icon: Skull,
          accent: CRIMSON,
          bg: 'rgba(240, 96, 107, 0.30)',
          message: 'Mafia',
        }
      : {
          icon: User,
          accent: MINT,
          bg: 'rgba(77, 232, 160, 0.24)',
          message: 'Town',
        },
}

export function resolveTileEventVisual(
  type: string,
  roleType?: string,
): TileEventVisual | null {
  const visual = TILE_EVENT_VISUALS[type]
  if (!visual) return null
  const normalizedRoleType = roleType?.trim().toLowerCase()
  return typeof visual === 'function' ? visual(normalizedRoleType) : visual
}

/**
 * Persistent tile border color per action type, from ACTION_REGISTRY.
 * Votes derive from currentVotes; night/special actions from the store's
 * actionBorders.
 */
export const TILE_BORDER_COLORS: Record<string, string> = Object.fromEntries(
  Object.entries(ACTION_REGISTRY).map(([type, def]) => [type, def.border]),
)

/**
 * Resolve the persistent border color for one tile.
 *
 * `myVoteTarget` is the tile of the CURRENT viewer's own latest vote — the
 * gold border marks where I last voted and moves when I revote (other
 * players' votes are not bordered; counts live in the vote badge).
 * Night-action borders (from the store's actionBorders) take precedence.
 */
export function resolveTileBorder(
  tileUserId: number | null,
  myVoteTarget: number | undefined,
  actionBorders: Partial<Record<number, string>>,
): string | undefined {
  if (tileUserId == null) return undefined
  const action = actionBorders[tileUserId]
  if (action != null) return TILE_BORDER_COLORS[action]
  if (myVoteTarget === tileUserId) return TILE_BORDER_COLORS.vote
  return undefined
}

export interface TileEvent {
  type: string
  targetId: number
  roleType?: string
  /** Revealed role name (e.g. lynch role reveal). */
  roleName?: string
  /** Secondary line — e.g. the voter behind a vote signal. */
  detail?: string
  key: string
}

export interface TileEventSource {
  logs: GameLogEntry[]
  lynchTargetId: number | null
  detectResult: { targetId: number; roleType: string } | null
  // Index of the first newly-arrived log in `logs`. Only logs from this index
  // onward are considered, so "saved" detection is scoped to a single night
  // rather than cross-matching a heal from one round with a kill from another.
  newLogStart?: number
}

export function deriveTileEvents({
  logs,
  lynchTargetId,
  detectResult,
  newLogStart = 0,
}: TileEventSource): TileEvent[] {
  const events: TileEvent[] = []

  // A target that was both killed and healed in the same night was saved —
  // collapse its death/heal logs into a single "saved" event instead of two.
  const healedTargets = new Set<number>()
  const killedTargets = new Set<number>()
  for (let i = newLogStart; i < logs.length; i++) {
    const log = logs[i]
    if (log.target_id == null) continue
    if (log.action_type === 'heal') healedTargets.add(log.target_id)
    else if (DEATH_ACTIONS.has(log.action_type))
      killedTargets.add(log.target_id)
  }
  const savedTargets = new Set(
    [...killedTargets].filter((id) => healedTargets.has(id)),
  )

  for (let i = newLogStart; i < logs.length; i++) {
    const log = logs[i]
    if (log.target_id == null) continue
    const isDeath = DEATH_ACTIONS.has(log.action_type)
    const isHeal = log.action_type === 'heal'
    if ((isDeath || isHeal) && savedTargets.has(log.target_id)) continue
    // Votes animate only as live signals — the day's full vote history
    // arriving in one batch (submit-votes/sunset) must not flash every
    // voted tile at once.
    if (log.action_type === 'vote') continue
    // Detect results are private to the detective (detect_result event) —
    // never animate them from broadcast logs.
    if (log.action_type === 'detect') continue
    if (!TILE_EVENT_VISUALS[log.action_type]) continue
    events.push({
      type: log.action_type,
      targetId: log.target_id,
      roleName: log.role_name ?? undefined,
      key: `${log.action_type}:${log.target_id}:${i}`,
    })
  }

  for (const targetId of savedTargets) {
    events.push({
      type: 'saved',
      targetId,
      key: `saved:${targetId}:${newLogStart}`,
    })
  }

  if (lynchTargetId != null) {
    const lynchLog = logs.find((l) => l.action_type === 'lynch')
    events.push({
      type: 'lynch',
      targetId: lynchTargetId,
      roleName: lynchLog?.role_name ?? undefined,
      key: `lynch:${lynchTargetId}`,
    })
  }

  if (detectResult != null) {
    events.push({
      type: 'investigate',
      targetId: detectResult.targetId,
      roleType: detectResult.roleType,
      key: `investigate:${detectResult.targetId}`,
    })
  }

  return events
}
