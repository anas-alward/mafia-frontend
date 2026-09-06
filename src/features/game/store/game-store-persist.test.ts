import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Simulates the USER'S persisted localStorage blob written by the previous
// code version (before voterSelection / actionBorders existed) and verifies
// that rehydration + vote_cast updates still work end to end.

const oldBlob = {
  state: {
    phase: 'day',
    sessionId: 'realsession',
    gameStarted: true,
    playerIds: [1, 2, 3],
    alivePlayerIds: [1, 2, 3],
    deadPlayerIds: [],
    players: [],
    myRoleCode: null,
    logs: [],
    currentVotes: [[1, 2]],
    lynchTargetId: null,
    hasVotedThisPhase: false,
    mafiaIds: [],
    mafiaMemberRoles: {},
    roundNumber: 1,
    requiredActions: [],
    winner: null,
  },
  version: 0,
}

async function freshStore() {
  // reset module registry so the store re-imports and rehydrates fresh
  vi.resetModules()
  const mod = await import('./game-store')
  return mod.useGameStore
}

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('mafia-game', JSON.stringify(oldBlob))
})

afterEach(() => {
  localStorage.clear()
  vi.resetModules()
})

describe('persist rehydration -> vote_cast flow', () => {
  it('rehydrates currentVotes as a Map from the old persisted blob', async () => {
    const store = await freshStore()
    const s = store.getState()
    expect(s.gameStarted).toBe(true)
    expect(s.currentVotes instanceof Map).toBe(true)
    expect(s.currentVotes.get(1)).toBe(2)
  })

  it('applies a live vote_cast after rehydration', async () => {
    const store = await freshStore()
    store.getState().processMessage({
      type: 'vote_cast',
      actor_id: 3,
      target_id: 2,
    })
    const s = store.getState()
    expect(s.currentVotes.get(3)).toBe(2)
    expect(s.currentVotes.size).toBe(2)
  })

  it('keeps voterSelection defined after rehydration', async () => {
    const store = await freshStore()
    const s = store.getState()
    expect(s.voterSelection).toBeDefined()
    expect(s.voterSelection.voterIds).toEqual([])
  })

  it('persists without throwing after a vote_cast (partialize path)', async () => {
    const store = await freshStore()
    store.getState().processMessage({
      type: 'vote_cast',
      actor_id: 3,
      target_id: 2,
    })
    // the persist middleware serializes state on every set — if currentVotes
    // were not a Map this would have thrown inside vote_cast already
    expect(store.getState().currentVotes instanceof Map).toBe(true)
  })
})
