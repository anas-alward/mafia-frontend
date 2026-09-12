import type { LucideIcon } from 'lucide-react'
import {
  HeartPulse,
  Search,
  Crosshair,
  Bomb,
  User,
  Landmark,
  Crown,
  Ban,
  Skull,
} from 'lucide-react'
import { ActionType } from './actions'
import type { ActionConfig } from './actions'
import { Phase } from './phases'

export enum PlayerStatus {
  ALIVE = 'alive',
  DEAD = 'dead',
}

export enum Team {
  MAFIA = 'mafia',
  TOWN = 'town',
}

// Mirrors backend: apps/game/engine/roles/type.py BaseRole
export interface RoleDefinition {
  code: string
  role_type: Team
  name: string
  description: string
  Icon: LucideIcon
  actions: Partial<Record<Phase, ActionConfig[]>>
}

export const TownDoctor: RoleDefinition = {
  code: 'doctor',
  role_type: Team.TOWN,
  name: 'Doctor',
  description: 'Protects one player from being eliminated each night.',
  Icon: HeartPulse,
  actions: {
    [Phase.NIGHT]: [{ action_type: ActionType.HEAL, required: true }],
    [Phase.DAY]: [{ action_type: ActionType.VOTE, required: true }],
  },
}

export const TownCop: RoleDefinition = {
  code: 'detective',
  role_type: Team.TOWN,
  name: 'Detective',
  description: 'Investigates one player each night to learn their alignment.',
  Icon: Search,
  actions: {
    [Phase.NIGHT]: [{ action_type: ActionType.DETECT, required: true }],
    [Phase.DAY]: [{ action_type: ActionType.VOTE, required: true }],
  },
}

export const TownVigilante: RoleDefinition = {
  code: 'vigilante',
  role_type: Team.TOWN,
  name: 'Azure Vigilante',
  description:
    'May shoot one player during the day instead of voting (2 bullets). Shooting a Town player eliminates the Vigilante too.',
  Icon: Crosshair,
  actions: {
    [Phase.DAY]: [
      { action_type: ActionType.SHOOT, required: false },
      { action_type: ActionType.VOTE, required: true },
    ],
  },
}

export const TownBomb: RoleDefinition = {
  code: 'bomb',
  role_type: Team.TOWN,
  name: 'Crimson Kamikaze',
  description:
    'Explodes upon death, eliminating whoever was responsible for killing them.',
  Icon: Bomb,
  actions: {
    [Phase.VOTE_RESULT]: [{ action_type: ActionType.REVENGE, required: true }],
    [Phase.DAY]: [{ action_type: ActionType.VOTE, required: true }],
  },
}

export const TownVanilla: RoleDefinition = {
  code: 'vanilla',
  role_type: Team.TOWN,
  name: 'Vanilla Townie',
  description: 'Has no special ability. Uses vote power during the day.',
  Icon: User,
  actions: {
    [Phase.DAY]: [{ action_type: ActionType.VOTE, required: true }],
  },
}

export const TownMayor: RoleDefinition = {
  code: 'mayor',
  role_type: Team.TOWN,
  name: 'Mayor',
  description: 'Elected town leader whose day vote counts as 3 votes.',
  Icon: Landmark,
  actions: {
    [Phase.DAY]: [{ action_type: ActionType.VOTE, required: true }],
  },
}

export const MafiaGodfather: RoleDefinition = {
  code: 'godfather',
  role_type: Team.MAFIA,
  name: 'Mafia King',
  description:
    "The leader of the Mafia. Appears as 'Town' if investigated by the Cop.",
  Icon: Crown,
  actions: {
    [Phase.NIGHT]: [
      { action_type: ActionType.KILL, required: true, priority: 1 },
    ],
    [Phase.DAY]: [{ action_type: ActionType.VOTE, required: true }],
  },
}

export const MafiaSilencer: RoleDefinition = {
  code: 'silencer',
  role_type: Team.MAFIA,
  name: 'Mafia Silencer',
  description:
    'Blocks one player each night, preventing them from using their action.',
  Icon: Ban,
  actions: {
    [Phase.NIGHT]: [
      { action_type: ActionType.KILL, required: true, priority: 2 },
      { action_type: ActionType.SILENCE, required: true },
    ],
    [Phase.DAY]: [{ action_type: ActionType.VOTE, required: true }],
  },
}

export const MafiaMember: RoleDefinition = {
  code: 'mafia_member',
  role_type: Team.MAFIA,
  name: 'Mafia Member',
  description: 'Basic Mafia member who participates in night kills.',
  Icon: Skull,
  actions: {
    [Phase.NIGHT]: [
      { action_type: ActionType.KILL, required: true, priority: 3 },
    ],
    [Phase.DAY]: [{ action_type: ActionType.VOTE, required: true }],
  },
}

// Mirrors backend: apps/game/engine/roles/type.py ROLES / ROLE_REGISTRY
export const ROLES: RoleDefinition[] = [
  TownDoctor,
  TownCop,
  TownVigilante,
  TownBomb,
  TownVanilla,
  TownMayor,
  MafiaGodfather,
  MafiaSilencer,
  MafiaMember,
]

export const ROLE_REGISTRY: Record<string, RoleDefinition> = Object.fromEntries(
  ROLES.map((role) => [role.code, role]),
)

/** Registry lookup for untyped role `code` strings. */
export function getRoleDefinition(code: string): RoleDefinition | undefined {
  return Object.hasOwn(ROLE_REGISTRY, code) ? ROLE_REGISTRY[code] : undefined
}

export const TEAM_COLORS: Record<Team, string> = {
  [Team.TOWN]: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  [Team.MAFIA]: 'bg-red-500/10 text-red-400 border-red-500/20',
}
