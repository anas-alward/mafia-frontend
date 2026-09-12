import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Participant } from 'livekit-client'
import { useParticipants } from '@livekit/components-react'
import TilesGrid from './tiles-grid'
import { useGameStore } from '#/features/game/store/game-store'

vi.mock('@livekit/components-react', () => ({
  useParticipants: vi.fn(() => []),
  useParticipantTracks: vi.fn(() => []),
  useIsSpeaking: vi.fn(() => false),
  VideoTrack: () => null,
}))

vi.mock('livekit-client', () => ({
  Track: { Source: { Camera: 'camera' } },
}))

function makeParticipant(identity: string, name: string): Participant {
  return {
    identity,
    name,
    isLocal: false,
  } as unknown as Participant
}

function renderGrid(participants: Participant[]) {
  vi.mocked(useParticipants).mockReturnValue(
    participants as ReturnType<typeof useParticipants>,
  )
  return render(<TilesGrid />)
}

beforeEach(() => {
  localStorage.clear()
  useGameStore.setState({
    gameStarted: false,
    playerIds: [],
    alivePlayerIds: [],
    deadPlayerIds: [],
    graveyardHoldUntil: {},
  })
})

afterEach(cleanup)

describe('TilesGrid spectator handling', () => {
  it('shows everyone while in the lobby', () => {
    const { container } = renderGrid([
      makeParticipant('1', 'Alice'),
      makeParticipant('2', 'Bob'),
    ])
    expect(container.textContent).toContain('Alice')
    expect(container.textContent).toContain('Bob')
  })

  it('removes connected users who were not dealt in once the game starts', () => {
    useGameStore.setState({
      gameStarted: true,
      playerIds: [1, 2],
      alivePlayerIds: [1, 2],
      deadPlayerIds: [],
    })
    const { container } = renderGrid([
      makeParticipant('1', 'Alice'),
      makeParticipant('2', 'Bob'),
      makeParticipant('3', 'Carol'),
    ])
    expect(container.textContent).toContain('Alice')
    expect(container.textContent).toContain('Bob')
    expect(container.textContent).not.toContain('Carol')
  })

  it('keeps dead players out of the grid', () => {
    useGameStore.setState({
      gameStarted: true,
      playerIds: [1, 2],
      alivePlayerIds: [1],
      deadPlayerIds: [2],
    })
    const { container } = renderGrid([
      makeParticipant('1', 'Alice'),
      makeParticipant('2', 'Bob'),
    ])
    expect(container.textContent).toContain('Alice')
    expect(container.textContent).not.toContain('Bob')
  })
})
