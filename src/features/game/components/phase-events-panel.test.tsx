import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from '#/features/game/store/game-store'
import { PhaseEventsPanel } from './phase-events-panel'
import type { GameStartedEvent, VoteCastEvent } from '#/features/game/events'

function startGame() {
  const msg: GameStartedEvent = {
    type: 'game_started',
    player_ids: [1, 2, 3],
    session_id: 's1',
    host: 1,
    alive_ids: [1, 2, 3],
    players: [
      { id: 1, code: 'a', name: 'Alice', status: 'alive' },
      { id: 2, code: 'b', name: 'Bob', status: 'alive' },
      { id: 3, code: 'c', name: 'Carol', status: 'alive' },
    ],
    required_actions: [],
  }
  useGameStore.getState().processMessage(msg)
}

function castVote(actorId: number, targetId: number) {
  const msg: VoteCastEvent = {
    type: 'vote_cast',
    actor_id: actorId,
    target_id: targetId,
  }
  useGameStore.getState().processMessage(msg)
}

afterEach(cleanup)

beforeEach(() => {
  localStorage.clear()
  useGameStore.setState({ gameStarted: false, currentVotes: new Map() })
})

describe('PhaseEventsPanel', () => {
  it('renders nothing before the game starts', () => {
    const { container } = render(<PhaseEventsPanel />)
    expect(container.innerHTML).toBe('')
  })

  it('lists everyone who still needs to vote with a pending count', () => {
    startGame()
    const { container } = render(<PhaseEventsPanel />)
    const text = container.textContent
    expect(text).toContain('3')
    expect(text).toContain('Alice')
    expect(text).toContain('Bob')
    expect(text).toContain('Carol')
  })

  it('drops players who already voted', () => {
    startGame()
    castVote(1, 2)
    castVote(3, 2)
    const { container } = render(<PhaseEventsPanel />)
    const text = container.textContent
    expect(text).toContain('1')
    expect(text).toContain('Bob')
    expect(text).not.toContain('Alice')
    expect(text).not.toContain('Carol')
  })

  it('renders nothing once every alive player has voted', () => {
    startGame()
    castVote(1, 2)
    castVote(2, 1)
    castVote(3, 1)
    const { container } = render(<PhaseEventsPanel />)
    expect(container.innerHTML).toBe('')
  })
})