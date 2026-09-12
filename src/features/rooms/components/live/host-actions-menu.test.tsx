import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Phase } from '#/features/game/constants/phases'
import { useGameStore } from '#/features/game/store/game-store'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { HostActionsMenu } from './host-actions-menu'

afterEach(cleanup)

beforeEach(() => {
  localStorage.clear()
  useGameStore.setState({
    gameStarted: true,
    phase: Phase.DAY,
    alivePlayerIds: [1, 2],
    currentVotes: new Map(),
    submitVotes: vi.fn(),
    submitVoteResult: vi.fn(),
    resetGame: vi.fn(),
    cancelGame: vi.fn(),
  })
  useMeetingStore.setState({ isHost: true })
})

describe('HostActionsMenu split button', () => {
  it('renders nothing for non-hosts', () => {
    useMeetingStore.setState({ isHost: false })
    const { container } = render(<HostActionsMenu />)
    expect(container.innerHTML).toBe('')
  })

  it('primary is disabled until every player has voted', () => {
    const { container } = render(<HostActionsMenu />)
    const primary = container.querySelector(
      '[aria-label="Submit Votes (primary)"]',
    ) as HTMLButtonElement
    expect(primary.disabled).toBe(true)
  })

  it('primary submits votes when all have voted', () => {
    useGameStore.setState({
      currentVotes: new Map([
        [1, 2],
        [2, 1],
      ]),
    })
    const { container } = render(<HostActionsMenu />)
    const primary = container.querySelector(
      '[aria-label="Submit Votes (primary)"]',
    ) as HTMLButtonElement
    expect(primary.disabled).toBe(false)
    fireEvent.click(primary)
    expect(useGameStore.getState().submitVotes).toHaveBeenCalled()
  })

  it('primary resolves votes during the vote-result phase', () => {
    useGameStore.setState({ phase: Phase.VOTE_RESULT })
    const { container } = render(<HostActionsMenu />)
    fireEvent.click(
      container.querySelector('[aria-label="Resolve Votes (primary)"]')!,
    )
    expect(useGameStore.getState().submitVoteResult).toHaveBeenCalled()
  })

  it('chevron opens a menu with the alternative actions only', () => {
    const { container } = render(<HostActionsMenu />)
    fireEvent.click(
      container.querySelector('[aria-label="Host actions menu"]')!,
    )
    const text = container.textContent
    expect(text).toContain('Reset Game')
    expect(text).toContain('Cancel Game')
    expect(text).not.toContain('Submit Votes\n')
  })

  it('clicking Reset Game asks for confirmation instead of resetting', () => {
    const { container, queryByRole } = render(<HostActionsMenu />)
    fireEvent.click(
      container.querySelector('[aria-label="Host actions menu"]')!,
    )
    fireEvent.click(
      [...container.querySelectorAll('button')].find(
        (b) => b.textContent === 'Reset Game',
      )!,
    )
    expect(useGameStore.getState().resetGame).not.toHaveBeenCalled()
    expect(queryByRole('dialog')?.textContent).toContain('Restart game?')
  })

  it('confirming the modal runs reset and closes it', () => {
    const { container, queryByRole, getByText } = render(<HostActionsMenu />)
    fireEvent.click(
      container.querySelector('[aria-label="Host actions menu"]')!,
    )
    fireEvent.click(
      [...container.querySelectorAll('button')].find(
        (b) => b.textContent === 'Reset Game',
      )!,
    )
    fireEvent.click(getByText('Restart game'))
    expect(useGameStore.getState().resetGame).toHaveBeenCalled()
    expect(queryByRole('dialog')).toBeNull()
  })

  it('canceling the modal runs nothing and closes it', () => {
    const { container, queryByRole, getByText } = render(<HostActionsMenu />)
    fireEvent.click(
      container.querySelector('[aria-label="Host actions menu"]')!,
    )
    fireEvent.click(
      [...container.querySelectorAll('button')].find(
        (b) => b.textContent === 'Cancel Game',
      )!,
    )
    expect(queryByRole('dialog')?.textContent).toContain('Cancel game?')
    fireEvent.click(getByText('Cancel'))
    expect(useGameStore.getState().cancelGame).not.toHaveBeenCalled()
    expect(useGameStore.getState().resetGame).not.toHaveBeenCalled()
    expect(queryByRole('dialog')).toBeNull()
  })

  it('confirming Cancel Game runs cancel and closes the modal', () => {
    const { container, queryByRole, getByText } = render(<HostActionsMenu />)
    fireEvent.click(
      container.querySelector('[aria-label="Host actions menu"]')!,
    )
    fireEvent.click(
      [...container.querySelectorAll('button')].find(
        (b) => b.textContent === 'Cancel Game',
      )!,
    )
    fireEvent.click(getByText('Cancel game'))
    expect(useGameStore.getState().cancelGame).toHaveBeenCalled()
    expect(queryByRole('dialog')).toBeNull()
  })

  it('Escape dismisses the modal without running anything', () => {
    const { container, queryByRole } = render(<HostActionsMenu />)
    fireEvent.click(
      container.querySelector('[aria-label="Host actions menu"]')!,
    )
    fireEvent.click(
      [...container.querySelectorAll('button')].find(
        (b) => b.textContent === 'Reset Game',
      )!,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(useGameStore.getState().resetGame).not.toHaveBeenCalled()
    expect(queryByRole('dialog')).toBeNull()
  })
})
