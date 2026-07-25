// ── Core Enums ──

export enum PlayerStatus {
  ALIVE = 'alive',
  DEAD = 'dead',
}

export enum ActionType {
  KILL = 'kill',
  REVENGE = 'revenge',
  VOTE = 'vote',
  HEAL = 'heal',
  DETECT = 'detect',
  SHOOT = 'shoot',
  ROLEBLOCK = 'roleblock',
  SILENT = 'silent',
  LYNCH = 'lynch',
}

export enum Phase {
  DAY = 'day',
  NIGHT = 'night',
  VOTE_RESULT = 'vote_result',
}

export enum Team {
  MAFIA = 'mafia',
  TOWN = 'town',
}

// ── Action Config ──
// Mirrors backend: apps/game/engine/constants.py ActionConfig dataclass

export interface ActionConfig {
  action_type: ActionType
  required: boolean
  priority?: number
}

// ── Role Definition ──
// Mirrors backend: apps/game/engine/roles/type.py BaseRole

export interface RoleDefinition {
  role_type: Team
  name: string
  description: string
  icon: string
  actions: Partial<Record<Phase, ActionConfig[]>>
}

// ── Town Roles ──
// Mirrors backend: apps/game/engine/roles/type.py

export const TownDoctor: RoleDefinition = {
  role_type: Team.TOWN,
  name: 'Doctor',
  description: 'Protects one player from being eliminated each night.',
  icon: 'heart-pulse',
  actions: {
    [Phase.NIGHT]: [
      { action_type: ActionType.HEAL, required: true },
    ],
    [Phase.DAY]: [
      { action_type: ActionType.VOTE, required: true },
    ],
  },
}

export const TownCop: RoleDefinition = {
  role_type: Team.TOWN,
  name: 'Detective',
  description: 'Investigates one player each night to learn their alignment.',
  icon: 'search',
  actions: {
    [Phase.NIGHT]: [
      { action_type: ActionType.DETECT, required: true },
    ],
    [Phase.DAY]: [
      { action_type: ActionType.VOTE, required: true },
    ],
  },
}

export const TownVigilante: RoleDefinition = {
  role_type: Team.TOWN,
  name: 'Azure Vigilante',
  description: 'Can choose to eliminate a player at night, but has limited ammo.',
  icon: 'crosshair',
  actions: {
    [Phase.NIGHT]: [
      { action_type: ActionType.SHOOT, required: false },
    ],
    [Phase.DAY]: [
      { action_type: ActionType.VOTE, required: true },
    ],
  },
}

export const TownBomb: RoleDefinition = {
  role_type: Team.TOWN,
  name: 'Crimson Kamikaze',
  description: 'Explodes upon death, eliminating whoever was responsible for killing them.',
  icon: 'bomb',
  actions: {
    [Phase.VOTE_RESULT]: [
      { action_type: ActionType.REVENGE, required: true },
    ],
    [Phase.DAY]: [
      { action_type: ActionType.VOTE, required: true },
    ],
  },
}

export const TownVanilla: RoleDefinition = {
  role_type: Team.TOWN,
  name: 'Vanilla Townie',
  description: 'Has no special ability. Uses vote power during the day.',
  icon: 'user',
  actions: {
    [Phase.DAY]: [
      { action_type: ActionType.VOTE, required: true },
    ],
  },
}

// ── Mafia Roles ──

export const MafiaGodfather: RoleDefinition = {
  role_type: Team.MAFIA,
  name: 'Mafia King',
  description: "The leader of the Mafia. Appears as 'Town' if investigated by the Cop.",
  icon: 'crown',
  actions: {
    [Phase.NIGHT]: [
      { action_type: ActionType.KILL, required: true, priority: 1 },
    ],
    [Phase.DAY]: [
      { action_type: ActionType.VOTE, required: true },
    ],
  },
}

export const MafiaRoleblocker: RoleDefinition = {
  role_type: Team.MAFIA,
  name: 'Mafia Silencer',
  description: 'Blocks one player each night, preventing them from using their action.',
  icon: 'ban',
  actions: {
    [Phase.NIGHT]: [
      { action_type: ActionType.KILL, required: true, priority: 2 },
      { action_type: ActionType.ROLEBLOCK, required: true },
    ],
    [Phase.DAY]: [
      { action_type: ActionType.VOTE, required: true },
    ],
  },
}

export const MafiaMember: RoleDefinition = {
  role_type: Team.MAFIA,
  name: 'Black Hand',
  description: 'Basic Mafia member who participates in night kills.',
  icon: 'skull',
  actions: {
    [Phase.NIGHT]: [
      { action_type: ActionType.KILL, required: true, priority: 3 },
    ],
    [Phase.DAY]: [
      { action_type: ActionType.VOTE, required: true },
    ],
  },
}

// ── Role Registry ──
// Mirrors backend: apps/game/engine/roles/type.py ROLES / ROLE_REGISTRY

export const ROLES: RoleDefinition[] = [
  TownDoctor,
  TownCop,
  TownVigilante,
  TownBomb,
  TownVanilla,
  MafiaGodfather,
  MafiaRoleblocker,
  MafiaMember,
]

export const ROLE_REGISTRY: Record<string, RoleDefinition> = Object.fromEntries(
  ROLES.map((role) => [role.name, role]),
)

// ── Timing ──
// Mirrors backend: apps/game/engine/round.py GRACE_SECONDS

export const GRACE_SECONDS = 5.0
