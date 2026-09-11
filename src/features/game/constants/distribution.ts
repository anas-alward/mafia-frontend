// Mirrors backend: apps/game/engine/roles/distributor.py ROLE_COMPOSITIONS.
// Keyed by exact player count — each value is the flat list of role codes
// dealt for a game of that size. Keep in sync with the backend table.
export const ROLE_COMPOSITIONS: Partial<Record<number, string[]>> = {
  6: [
    'doctor',
    'vanilla',
    'vanilla',
    'vanilla',
    'mafia_member',
    'mafia_member',
  ],
  7: [
    'doctor',
    'detective',
    'vanilla',
    'vanilla',
    'vanilla',
    'godfather',
    'mafia_member',
  ],
  8: [
    'doctor',
    'detective',
    'vanilla',
    'vanilla',
    'vanilla',
    'vanilla',
    'godfather',
    'silencer',
  ],
  9: [
    'doctor',
    'detective',
    'vigilante',
    'bomb',
    'vanilla',
    'vanilla',
    'godfather',
    'silencer',
    'mafia_member',
  ],
  10: [
    'doctor',
    'detective',
    'vigilante',
    'bomb',
    'vanilla',
    'vanilla',
    'vanilla',
    'godfather',
    'silencer',
    'mafia_member',
  ],
  11: [
    'doctor',
    'detective',
    'vigilante',
    'bomb',
    'vanilla',
    'vanilla',
    'vanilla',
    'vanilla',
    'godfather',
    'silencer',
    'mafia_member',
  ],
}

export const SUPPORTED_PLAYER_COUNTS = Object.keys(ROLE_COMPOSITIONS)
  .map(Number)
  .sort((a, b) => a - b)
