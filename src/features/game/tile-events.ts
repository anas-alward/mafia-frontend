import type { LucideIcon } from 'lucide-react'
import { Skull, HeartPulse, ShieldCheck, User } from 'lucide-react'
import type { GameLogEntry } from '#/features/game/events'

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

const ELIMINATED: TileEventVisual = {
  icon: Skull,
  accent: CRIMSON,
  bg: 'rgba(240, 96, 107, 0.30)',
  message: 'Eliminated',
}

export const TILE_EVENT_VISUALS: Partial<
  Record<string, TileEventVisualResolver>
> = {
  kill: ELIMINATED,
  died: ELIMINATED,
  shoot: ELIMINATED,
  revenge: ELIMINATED,
  lynch: ELIMINATED,
  heal: {
    icon: HeartPulse,
    accent: MINT,
    bg: 'rgba(77, 232, 160, 0.24)',
    message: 'Healed',
  },
  saved: {
    icon: ShieldCheck,
    accent: MINT,
    bg: 'rgba(77, 232, 160, 0.24)',
    message: 'Saved',
  },
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

export interface TileEvent {
  type: string
  targetId: number
  roleType?: string
  /** Revealed role name (e.g. lynch role reveal). */
  roleName?: string
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
    if (log.action_type === 'heal') healedTargets.add(log.target_id)
    else if (DEATH_ACTIONS.has(log.action_type))
      killedTargets.add(log.target_id)
  }
  const savedTargets = new Set(
    [...killedTargets].filter((id) => healedTargets.has(id)),
  )

  for (let i = newLogStart; i < logs.length; i++) {
    const log = logs[i]
    const isDeath = DEATH_ACTIONS.has(log.action_type)
    const isHeal = log.action_type === 'heal'
    if ((isDeath || isHeal) && savedTargets.has(log.target_id)) continue
    if (!TILE_EVENT_VISUALS[log.action_type]) continue
    events.push({
      type: log.action_type,
      targetId: log.target_id,
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
