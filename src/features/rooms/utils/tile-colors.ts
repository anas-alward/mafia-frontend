const TILE_COLORS = [
  '#2D2A38',
  '#2A352E',
  '#2E3038',
  '#352E2A',
  '#2A3038',
  '#332C36',
  '#2C3230',
  '#36302C',
  '#28302E',
  '#312A33',
  '#2E312A',
  '#342D30',
  '#2B3035',
  '#302F28',
  '#2D2E36',
  '#332B2E',
  '#29322C',
  '#362E32',
  '#2C2F34',
  '#312D2A',
  '#2A2E35',
  '#2F2C32',
  '#2E332D',
  '#342A2E',
]

// Deterministic via Knuth multiplicative hash — avoids same-color
// collisions across the small set of participants in a room.
export function getTileColor(userId: number | null): string {
  if (userId == null) return TILE_COLORS[0]
  const hash = ((userId * 2654435761) >>> 0) % TILE_COLORS.length
  return TILE_COLORS[hash]
}
