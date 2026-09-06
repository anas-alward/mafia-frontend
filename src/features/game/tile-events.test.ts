import { describe, expect, it } from 'vitest'
import { resolveActorName, resolveTileBorder } from './tile-events'
import type { GameStatePlayer } from './events'

const gamePlayers: GameStatePlayer[] = [
  { id: 1, code: 'a', status: 'alive', name: '' },
  { id: 2, code: 'b', status: 'alive', name: 'Alice' },
  { id: 3, code: 'c', status: 'alive', name: null },
]

describe('resolveActorName', () => {
  it('prefers the game state name', () => {
    expect(resolveActorName(2, gamePlayers, [])).toBe('Alice')
  })

  it('falls through empty game-state names to participants', () => {
    const participants = [{ userId: 1, username: 'Bob' }]
    expect(resolveActorName(1, gamePlayers, participants)).toBe('Bob')
  })

  it('falls through null game-state names to participants', () => {
    const participants = [{ userId: 3, username: 'Carol' }]
    expect(resolveActorName(3, gamePlayers, participants)).toBe('Carol')
  })

  it('falls back to a placeholder when nothing resolves', () => {
    expect(resolveActorName(9, [], [])).toBe('Player 9')
  })

  it('returns undefined for hidden actors (null actor_id)', () => {
    expect(resolveActorName(null, gamePlayers, [])).toBeUndefined()
  })
})

describe('resolveTileBorder', () => {
  it('gold border on the tile I voted for', () => {
    expect(resolveTileBorder(5, 5, {})).toBe('var(--game-gold)')
  })

  it('moves to the newest target when I revote', () => {
    // voted 5, then changed to 9 — old target clears, new one borders
    expect(resolveTileBorder(5, 9, {})).toBeUndefined()
    expect(resolveTileBorder(9, 9, {})).toBe('var(--game-gold)')
  })

  it('ignores other players votes (my view shows only my vote)', () => {
    expect(resolveTileBorder(5, 9, {})).toBeUndefined()
  })

  it('night-action borders take precedence over my vote', () => {
    expect(resolveTileBorder(7, 7, { 7: 'heal' })).toBe('var(--game-mint)')
  })

  it('no border without a tile or a vote', () => {
    expect(resolveTileBorder(null, 5, {})).toBeUndefined()
    expect(resolveTileBorder(3, undefined, {})).toBeUndefined()
  })
})
