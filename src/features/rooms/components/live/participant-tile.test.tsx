import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Participant } from 'livekit-client'
import LiveParticipantTile from './participant-tile'
import { useGameStore } from '#/features/game/store/game-store'
import { useAuthStore } from '#/features/auth/store/auth-store'

vi.mock('@livekit/components-react', () => ({
  useParticipantTracks: vi.fn(() => []),
  useIsSpeaking: vi.fn(() => false),
  VideoTrack: () => null,
}))

vi.mock('livekit-client', () => ({
  Track: { Source: { Camera: 'camera' } },
}))

function makeParticipant(identity: string): Participant {
  return {
    identity,
    name: `Player ${identity}`,
    isLocal: false,
  } as unknown as Participant
}

function renderTile(identity: string) {
  const { container } = render(
    <LiveParticipantTile
      participant={makeParticipant(identity)}
      isSelected={false}
      isSelectable={false}
      onSelect={() => {}}
    />,
  )
  return container.firstElementChild as HTMLElement
}

beforeEach(() => {
  localStorage.clear()
  useAuthStore.setState({ user: { id: 1 } as never })
  useGameStore.setState({
    gameStarted: true,
    alivePlayerIds: [1, 5, 9],
    deadPlayerIds: [],
    currentVotes: new Map(),
    actionBorders: {},
  })
})

afterEach(cleanup)

describe('LiveParticipantTile action border', () => {
  it('draws a 3px gold inline shadow on the tile I voted for', () => {
    useGameStore.setState({ currentVotes: new Map([[1, 5]]) })
    const root = renderTile('5')
    expect(root.style.boxShadow).toContain('0 0 0 3px')
    expect(root.style.boxShadow).toContain('var(--game-gold)')
  })

  it('moves the shadow when I revote', () => {
    useGameStore.setState({ currentVotes: new Map([[1, 5]]) })
    useGameStore.setState({ currentVotes: new Map([[1, 9]]) })
    const oldTarget = renderTile('5')
    const newTarget = renderTile('9')
    expect(oldTarget.style.boxShadow).toBe('')
    expect(newTarget.style.boxShadow).toContain('0 0 0 3px')
  })

  it('no shadow for votes cast by other players', () => {
    useGameStore.setState({ currentVotes: new Map([[2, 5]]) })
    const root = renderTile('5')
    expect(root.style.boxShadow).toBe('')
  })

  it('action borders render in their action color', () => {
    useGameStore.setState({ actionBorders: { 5: 'kill' } })
    const root = renderTile('5')
    expect(root.style.boxShadow).toContain('0 0 0 3px')
    expect(root.style.boxShadow).toContain('var(--game-crimson)')
  })

  it('keeps the border when the target is speaking', async () => {
    const { useIsSpeaking } = await import('@livekit/components-react')
    vi.mocked(useIsSpeaking).mockReturnValue(true)
    useGameStore.setState({ currentVotes: new Map([[1, 5]]) })
    const root = renderTile('5')
    expect(root.style.boxShadow).toContain('0 0 0 3px')
    expect(root.style.boxShadow).toContain('0 0 20px')
    vi.mocked(useIsSpeaking).mockReturnValue(false)
  })

  it('hides the my-vote gold border while a voter selection is active', () => {
    useGameStore.setState({ currentVotes: new Map([[1, 5]]) })
    useGameStore.setState({ voterSelection: { targetId: 5, voterIds: [9] } })
    const root = renderTile('5')
    expect(root.style.boxShadow).toBe('')
  })

  it('restores the gold border when the voter selection clears', () => {
    useGameStore.setState({ currentVotes: new Map([[1, 5]]) })
    useGameStore.setState({ voterSelection: { targetId: 5, voterIds: [9] } })
    act(() => {
      useGameStore.getState().clearVoterSelection()
    })
    const root = renderTile('5')
    expect(root.style.boxShadow).toContain('0 0 0 3px')
    expect(root.style.boxShadow).toContain('var(--game-gold)')
  })

  it('outlines the selected voters while a selection is active', () => {
    useGameStore.setState({ currentVotes: new Map([[1, 5]]) })
    useGameStore.setState({ voterSelection: { targetId: 5, voterIds: [9] } })
    const voterTile = renderTile('9')
    expect(voterTile.style.outline).toContain('2px solid')
  })
})

describe('LiveParticipantTile regressed behaviour', () => {
  it('still shows and reactively updates the vote count badge', () => {
    useGameStore.setState({ currentVotes: new Map() })
    const root = renderTile('5')
    expect(root.textContent).not.toContain('1')
    act(() => {
      useGameStore.setState({ currentVotes: new Map([[1, 5]]) })
    })
    expect(root.textContent).toContain('1')
  })
})
