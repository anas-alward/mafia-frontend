import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from './game-store'
import type { ActionSignalEvent, GameStartedEvent, SunRiseEvent } from '../events'

function startGame() {
  const msg: GameStartedEvent = {
    type: 'game_started',
    player_ids: [1, 2, 3],
    session_id: 's1',
    host: 1,
    alive_ids: [1, 2, 3],
    players: [
      { id: 1, code: 'a', status: 'alive' },
      { id: 2, code: 'b', status: 'alive' },
      { id: 3, code: 'c', status: 'alive' },
    ],
    required_actions: [],
  }
  useGameStore.getState().processMessage(msg)
}

function signal(actionType: string, targetId: number, actorId: number | null) {
  const msg: ActionSignalEvent = {
    type: 'action_signal',
    action_type: actionType,
    target_id: targetId,
    actor_id: actorId,
  }
  useGameStore.getState().processMessage(msg)
}

beforeEach(() => {
  localStorage.clear()
  useGameStore.setState({ gameStarted: false, currentVotes: new Map() })
})

describe('game store night_action real-time requirements', () => {
  it('marks the matching phase requirement done in real time', () => {
    startGame()
    useGameStore.setState({
      roundRequirements: [
        { action_type: 'kill', done: false },
        { action_type: 'heal', done: false },
      ],
    })
    useGameStore.getState().processMessage({
      type: 'night_action',
      action_type: 'kill',
    })
    const rr = useGameStore.getState().roundRequirements
    expect(rr.find((r) => r.action_type === 'kill')?.done).toBe(true)
    expect(rr.find((r) => r.action_type === 'heal')?.done).toBe(false)
  })
})

describe('game store action borders', () => {
  it('records a persistent border for non-vote signals', () => {
    startGame()
    signal('heal', 7, 2)
    expect(useGameStore.getState().actionBorders).toEqual({ 7: 'heal' })
  })

  it('excludes vote signals (vote borders derive from currentVotes)', () => {
    startGame()
    signal('vote', 7, 2)
    expect(useGameStore.getState().actionBorders).toEqual({})
  })

  it('overwrites the border when the same target is re-targeted', () => {
    startGame()
    signal('detect', 7, 2)
    signal('heal', 7, 3)
    expect(useGameStore.getState().actionBorders).toEqual({ 7: 'heal' })
  })

  it('clears borders on phase transitions', () => {
    startGame()
    signal('kill', 7, 2)
    const msg: SunRiseEvent = {
      type: 'sun_rise',
      player_ids: [1, 2, 3],
      logs: [],
      required_actions: [],
    }
    useGameStore.getState().processMessage(msg)
    expect(useGameStore.getState().actionBorders).toEqual({})
  })
})
