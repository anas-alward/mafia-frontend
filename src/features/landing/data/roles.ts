import {
  MafiaMember,
  TownVanilla,
  TownCop,
  TownDoctor,
} from '#/features/game/constants'
import type { RoleDefinition } from '#/features/game/constants'

export type RoleAlignment = 'town' | 'mafia' | 'neutral'

export interface GameRole {
  id: string
  name: string
  alignment: RoleAlignment
  description: string
  nightAction: string
  icon: string
}

const alignmentLabels: Record<RoleAlignment, string> = {
  town: 'Town',
  mafia: 'Mafia',
  neutral: 'Neutral',
}

export function getAlignmentLabel(alignment: RoleAlignment): string {
  return alignmentLabels[alignment]
}

function toGameRole(
  role: RoleDefinition,
  nightAction: string,
): GameRole {
  return {
    id: role.name,
    name: role.name,
    alignment: role.role_type,
    description: role.description,
    nightAction,
    icon: role.icon,
  }
}

export const roles: GameRole[] = [
  toGameRole(
    MafiaMember,
    'Choose a player to eliminate. Only one kill per night — Mafia members must agree on the target.',
  ),
  toGameRole(
    TownVanilla,
    'Sleep with one eye open. You have no night action — your power lies in deduction and persuasion during the day.',
  ),
  toGameRole(
    TownCop,
    "Choose a player to investigate. The moderator reveals whether that player is Mafia or not.",
  ),
  toGameRole(
    TownDoctor,
    'Choose a player to protect. If the Mafia targets that player, they survive the night.',
  ),
]
