import type { LucideIcon } from 'lucide-react'
import {
  Ban,
  HeartPulse,
  MicOff,
  Search,
  Crosshair,
  Bomb,
  Skull,
  Vote,
} from 'lucide-react'

export enum ActionType {
  KILL = 'kill',
  REVENGE = 'revenge',
  VOTE = 'vote',
  HEAL = 'heal',
  DETECT = 'detect',
  SHOOT = 'shoot',
  SILENCE = 'silence',
  LYNCH = 'lynch',
}

// Mirrors backend: apps/game/engine/constants.py ActionConfig dataclass
export interface ActionConfig {
  action_type: ActionType
  required: boolean
  priority?: number
}

// Single source of truth for how each action LOOKS: action orbs, tile event
// animations (icon/color/bg/message) and persistent tile border colors.
// Previously duplicated across tile-action-overlay.tsx and tile-events.ts.
export interface ActionDefinition {
  /** Icon on the hover action orb. */
  Icon: LucideIcon
  /** Tooltip/title on the action orb. */
  label: string
  /** Accent color: orb tint and tile-event headline. */
  color: string
  /** Backdrop color of the tile event animation overlay. */
  bg: string
  /** Persistent tile border color while the action is pending/resolved. */
  border: string
  /** Icon in the tile event animation (deaths all show a skull). */
  eventIcon: LucideIcon
  /** Headline text in the tile event animation. */
  eventMessage: string
}

export const ACTION_REGISTRY: Record<ActionType, ActionDefinition> = {
  [ActionType.VOTE]: {
    Icon: Vote,
    label: 'Vote',
    color: 'var(--game-gold)',
    bg: 'rgba(237, 184, 58, 0.22)',
    border: 'var(--game-gold)',
    eventIcon: Vote,
    eventMessage: 'Vote',
  },
  [ActionType.KILL]: {
    Icon: Skull,
    label: 'Kill',
    color: 'var(--game-crimson)',
    bg: 'rgba(240, 96, 107, 0.30)',
    border: 'var(--game-crimson)',
    eventIcon: Skull,
    eventMessage: 'Eliminated',
  },
  [ActionType.REVENGE]: {
    Icon: Bomb,
    label: 'Revenge',
    color: 'var(--game-crimson)',
    bg: 'rgba(240, 96, 107, 0.30)',
    border: 'var(--game-crimson)',
    eventIcon: Skull,
    eventMessage: 'Eliminated',
  },
  [ActionType.HEAL]: {
    Icon: HeartPulse,
    label: 'Heal',
    color: 'var(--game-mint)',
    bg: 'rgba(77, 232, 160, 0.24)',
    border: 'var(--game-mint)',
    eventIcon: HeartPulse,
    eventMessage: 'Healed',
  },
  [ActionType.DETECT]: {
    Icon: Search,
    label: 'Detect',
    color: 'var(--game-periwinkle)',
    bg: 'rgba(143, 160, 245, 0.24)',
    border: 'var(--game-periwinkle)',
    eventIcon: Search,
    eventMessage: 'Detect',
  },
  [ActionType.SHOOT]: {
    Icon: Crosshair,
    label: 'Shoot',
    color: '#F5925E',
    bg: 'rgba(240, 96, 107, 0.30)',
    border: '#F5925E',
    eventIcon: Skull,
    eventMessage: 'Eliminated',
  },
  [ActionType.SILENCE]: {
    Icon: Ban,
    label: 'Silence',
    color: '#C49EF0',
    bg: 'rgba(196, 158, 240, 0.24)',
    border: '#C49EF0',
    eventIcon: MicOff,
    eventMessage: 'Silenced',
  },
  [ActionType.LYNCH]: {
    Icon: Skull,
    label: 'Lynch',
    color: 'var(--game-crimson)',
    bg: 'rgba(240, 96, 107, 0.30)',
    border: 'var(--game-crimson)',
    eventIcon: Skull,
    eventMessage: 'Eliminated',
  },
}

/** Registry lookup for untyped backend `action_type` strings. */
export function getActionDefinition(
  actionType: string,
): ActionDefinition | undefined {
  return Object.hasOwn(ACTION_REGISTRY, actionType)
    ? ACTION_REGISTRY[actionType as ActionType]
    : undefined
}
