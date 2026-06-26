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

export const roles: GameRole[] = [
  {
    id: 'mafia',
    name: 'Mafia',
    alignment: 'mafia',
    description:
      'Members of the Mafia know each other and work together to eliminate the Townspeople. They must blend in during the day to avoid suspicion.',
    nightAction:
      'Choose a player to eliminate. Only one kill per night — Mafia members must agree on the target.',
    icon: 'skull',
  },
  {
    id: 'townsperson',
    name: 'Townsperson',
    alignment: 'town',
    description:
      "Ordinary citizens trying to survive. No special abilities, but your vote during the day is just as powerful as anyone else's.",
    nightAction:
      'Sleep with one eye open. You have no night action — your power lies in deduction and persuasion during the day.',
    icon: 'users',
  },
  {
    id: 'detective',
    name: 'Detective',
    alignment: 'town',
    description:
      "Each night, investigate one player to uncover their true allegiance. Use your findings to guide the town's vote — but be careful who you trust.",
    nightAction:
      'Choose a player to investigate. The moderator reveals whether that player is Mafia or not.',
    icon: 'search',
  },
  {
    id: 'doctor',
    name: 'Doctor',
    alignment: 'town',
    description:
      'Each night, choose one player to protect from being killed. You can save yourself, but not the same person two nights in a row.',
    nightAction:
      'Choose a player to protect. If the Mafia targets that player, they survive the night.',
    icon: 'shield',
  },
]
