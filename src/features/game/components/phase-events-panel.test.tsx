import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from '#/features/game/store/game-store'
import { PhaseEventsPanel } from './phase-events-panel'
import type { GameStartedEvent, VoteCastEvent } from '#/features/game/events'

const NAMES = ['Alice', 'Bob', 'Carol', 'Dave']

function startGame(playerCount = 3) {
  const ids = Array.from({ length: playerCount }, (_, i) => i + 1)
  const msg: GameStartedEvent = {
    type: 'game_started',
    player_ids: ids,
    session_id: 's1',
    host: 1,
    alive_ids: ids,
    players: ids.map((id) => ({
      id,
      code: `p${id}`,
      name: NAMES[id - 1],
      status: 'alive' as const,
    })),
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

  it('renders one vote avatar while players still need to vote', () => {
    startGame()
    const { container } = render(<PhaseEventsPanel />)
    expect(
      container.querySelector('[aria-label="3 required actions: vote"]'),
    ).not.toBeNull()
  })

  it('drops players who already voted', () => {
    startGame()
    castVote(1, 2)
    castVote(3, 2)
    const { container } = render(<PhaseEventsPanel />)
    expect(
      container.querySelector('[aria-label="1 required action: vote"]'),
    ).not.toBeNull()
  })

  it('renders nothing once every alive player has voted', () => {
    startGame()
    castVote(1, 2)
    castVote(2, 1)
    castVote(3, 1)
    const { container } = render(<PhaseEventsPanel />)
    expect(container.innerHTML).toBe('')
  })

  it('tooltip lists the players who still need to vote', () => {
    startGame()
    castVote(1, 2)
    const { container } = render(<PhaseEventsPanel />)
    fireEvent.mouseEnter(
      container.querySelector('[aria-label="2 required actions: vote"]')!,
    )
    const text = container.textContent
    expect(text).toContain('Bob')
    expect(text).toContain('Carol')
    expect(text).not.toContain('Alice')
  })
})