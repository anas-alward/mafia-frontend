import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from '#/features/game/store/game-store'
import { VoteCountBadge } from './vote-count-badge'
import type { GameStartedEvent, VoteCastEvent } from '#/features/game/events'

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

describe('VoteCountBadge', () => {
  it('shows the number of votes cast for a player', () => {
    startGame()
    castVote(1, 2)
    castVote(3, 2)
    const { container } = render(<VoteCountBadge userId={2} />)
    expect(container.textContent).toBe('2')
  })

  it('renders nothing when the player has no votes', () => {
    startGame()
    castVote(1, 2)
    const { container } = render(<VoteCountBadge userId={3} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders nothing before the game starts', () => {
    const { container } = render(<VoteCountBadge userId={2} />)
    expect(container.innerHTML).toBe('')
  })

  it('updates reactively when a new vote arrives', () => {
    startGame()
    const { container } = render(<VoteCountBadge userId={2} />)
    expect(container.innerHTML).toBe('')
    act(() => {
      castVote(1, 2)
    })
    expect(container.textContent).toBe('1')
  })
})

describe('VoteCountBadge voter selection', () => {
  it('clicking the badge selects the voters of that target', () => {
    startGame()
    castVote(1, 2)
    castVote(3, 2)
    const { container } = render(<VoteCountBadge userId={2} />)
    fireEvent.click(container.querySelector('button')!)
    expect(useGameStore.getState().voterSelection).toEqual({
      targetId: 2,
      voterIds: [1, 3],
    })
  })

  it('clicking the badge again toggles the selection off', () => {
    startGame()
    castVote(1, 2)
    const { container } = render(<VoteCountBadge userId={2} />)
    fireEvent.click(container.querySelector('button')!)
    fireEvent.click(container.querySelector('button')!)
    expect(useGameStore.getState().voterSelection).toEqual({
      targetId: null,
      voterIds: [],
    })
  })

  it('clicking outside a badge clears the selection', () => {
    startGame()
    castVote(1, 2)
    const { container } = render(<VoteCountBadge userId={2} />)
    fireEvent.click(container.querySelector('button')!)
    expect(useGameStore.getState().voterSelection.targetId).toBe(2)
    document.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(useGameStore.getState().voterSelection).toEqual({
      targetId: null,
      voterIds: [],
    })
  })

  it('a pointerdown inside a badge does not clear the selection', () => {
    startGame()
    castVote(1, 2)
    const { container } = render(<VoteCountBadge userId={2} />)
    fireEvent.click(container.querySelector('button')!)
    const badge = container.querySelector('[data-vote-count-badge]')!
    badge.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(useGameStore.getState().voterSelection.targetId).toBe(2)
  })
})
