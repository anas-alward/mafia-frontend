import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Participant } from 'livekit-client'
import { useParticipants } from '@livekit/components-react'
import { MembersList } from './members-list'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { useGameStore } from '#/features/game/store/game-store'

const sendDisable = vi.fn()

let fakeRoom: unknown

vi.mock('@livekit/components-react', () => ({
  useParticipants: vi.fn(() => []),
  useRoomContext: vi.fn(() => fakeRoom),
}))

vi.mock('livekit-client', () => ({
  Track: { Source: { Microphone: 'microphone', Camera: 'camera' } },
}))

vi.mock('#/features/rooms/utils/host-media', () => ({
  sendHostMediaDisable: (...args: unknown[]) => sendDisable(...args),
}))

function makeParticipant(
  identity: string,
  name: string,
  { micMuted = false, camMuted = false, isLocal = false } = {},
): Participant {
  return {
    identity,
    name,
    isLocal,
    getTrackPublication: (source: string) => ({
      isMuted: source === 'microphone' ? micMuted : camMuted,
    }),
  } as unknown as Participant
}

function renderList(participants: Participant[]) {
  vi.mocked(useParticipants).mockReturnValue(
    participants as ReturnType<typeof useParticipants>,
  )
  return render(<MembersList />)
}

beforeEach(() => {
  fakeRoom = { id: 'room' }
  sendDisable.mockClear()
  useMeetingStore.setState({ isHost: false })
  useGameStore.setState({ gameStarted: false, deadPlayerIds: [] })
})

afterEach(cleanup)

describe('MembersList', () => {
  it('shows every connected member by name', () => {
    const { container } = renderList([
      makeParticipant('1', 'Alice'),
      makeParticipant('2', 'Bob', { isLocal: true }),
    ])
    const text = container.textContent
    expect(text).toContain('Alice')
    expect(text).toContain('Bob')
  })

  it('shows the empty state with no participants', () => {
    const { container } = renderList([])
    expect(container.textContent).toContain('No members connected')
  })

  it('a non-host sees status icons but no control buttons', () => {
    useMeetingStore.setState({ isHost: false })
    const { container } = renderList([makeParticipant('2', 'Bob')])
    expect(container.querySelectorAll('button')).toHaveLength(0)
    expect(container.querySelector('[aria-label="Microphone on"]')).not.toBeNull()
    expect(container.querySelector('[aria-label="Camera on"]')).not.toBeNull()
  })

  it('the host gets disable buttons for other members', () => {
    useMeetingStore.setState({ isHost: true })
    const { container } = renderList([
      makeParticipant('1', 'Alice', { isLocal: true }),
      makeParticipant('2', 'Bob'),
    ])
    // Only for Bob, not for self
    expect(container.querySelector('[aria-label="Turn off Bob\'s microphone"]')).not.toBeNull()
    expect(container.querySelector('[aria-label="Turn off Alice\'s microphone"]')).toBeNull()
  })

  it('clicking the host mic button sends a disable request', () => {
    useMeetingStore.setState({ isHost: true })
    const { container } = renderList([makeParticipant('2', 'Bob')])
    fireEvent.click(
      container.querySelector('[aria-label="Turn off Bob\'s microphone"]')!,
    )
    expect(sendDisable).toHaveBeenCalledWith(expect.anything(), '2', 'microphone')
  })

  it('the mic disable button is disabled when the mic is already off', () => {
    useMeetingStore.setState({ isHost: true })
    const { container } = renderList([
      makeParticipant('2', 'Bob', { micMuted: true }),
    ])
    const button = container.querySelector(
      '[aria-label="Turn off Bob\'s microphone"]',
    ) as HTMLButtonElement
    expect(button.disabled).toBe(true)
    fireEvent.click(button)
    expect(sendDisable).not.toHaveBeenCalled()
  })
})
