export interface GamePhase {
  id: string
  name: string
  order: number
  description: string
  activeRoles: string
  icon: string
}

export const phases: GamePhase[] = [
  {
    id: 'night',
    name: 'Night Phase',
    order: 1,
    description:
      'The village falls silent. Mafia members secretly choose a target. The Detective investigates a suspicious player. The Doctor protects someone from harm. All actions are hidden — only the moderator knows everything.',
    activeRoles: 'Mafia, Detective, Doctor',
    icon: 'moon',
  },
  {
    id: 'day',
    name: 'Day Phase',
    order: 2,
    description:
      'The village wakes up. The moderator reveals what happened overnight — who was killed, or if the Doctor made a save. Players discuss, accuse, defend, and form alliances. Deception and deduction collide.',
    activeRoles: 'All players',
    icon: 'sun',
  },
  {
    id: 'voting',
    name: 'Voting',
    order: 3,
    description:
      'After discussion, everyone casts a vote to eliminate one suspected Mafia member. The accused gets a final chance to defend themselves. The player with the most votes is eliminated and their role is revealed.',
    activeRoles: 'All players',
    icon: 'gavel',
  },
]
