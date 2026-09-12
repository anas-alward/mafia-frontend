import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Participant } from 'livekit-client'
import { useParticipants } from '@livekit/components-react'
import { GraveyardStrip } from './graveyard-rail'
import { useGameStore } from '#/features/game/store/game-store'
import { useAuthStore } from '#/features/auth/store/auth-store'

vi.mock('@livekit/components-react', () => ({
  useParticipants: vi.fn(() => []),
  useParticipantTracks: vi.fn(() => []),
  VideoTrack: () => null,
}))

vi.mock('livekit-client', () => ({
  Track: { Source: { Camera: 'camera' } },
}))

function makeParticipant(identity: string, isLocal = false): Participant {
  return {
    identity,
    name: `User ${identity}`,
    isLocal,
  } as unknown as Participant
}

function renderStrip(participants: Participant[]) {
  vi.mocked(useParticipants).mockReturnValue(
    participants as ReturnType<typeof useParticipants>,
  )
  return render(<GraveyardStrip />)
}

beforeEach(() => {
  localStorage.clear()
  useGameStore.setState({
    gameStarted: true,
    playerIds: [1],
    alivePlayerIds: [1],
    deadPlayerIds: [],
    players: [],
    logs: [],
  })
  useAuthStore.setState({
    user: { id: 2, email: 'spectator@example.com', username: 'spectator' },
  })
})

afterEach(cleanup)

describe('GraveyardStrip spectator handling', () => {
  it('does not show the local user in the spectator strip', () => {
    const { container } = renderStrip([
      makeParticipant('1'),
      makeParticipant('2', true),
    ])
    expect(container.textContent).not.toContain('User 2')
  })

  it('still shows remote spectators', () => {
    const { container } = renderStrip([
      makeParticipant('1'),
      makeParticipant('2', true),
      makeParticipant('3'),
    ])
    expect(container.textContent).toContain('User 3')
  })
})
