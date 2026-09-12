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
    name: 'Night',
    order: 1,
    description:
      'Lights out. The Mafia quietly pick a target, the Detective checks someone\u2019s alignment, the Doctor shields a hunch. Nobody sees a thing \u2014 every choice stays secret until morning.',
    activeRoles: 'Mafia, Detective, Doctor',
    icon: 'moon',
  },
  {
    id: 'day',
    name: 'Day',
    order: 2,
    description:
      'Morning comes with news: someone might be gone \u2014 unless the Doctor guessed right. Everyone talks at once. Accuse, deflect, bluff. Trust no one, especially your friends.',
    activeRoles: 'All players',
    icon: 'sun',
  },
  {
    id: 'voting',
    name: 'Vote',
    order: 3,
    description:
      'Talk is over. Everyone votes, the top suspect is out, and their role is revealed for all to see. Then night falls again \u2014 until one side is gone.',
    activeRoles: 'All players',
    icon: 'gavel',
  },
]
