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

function resetButton(container: HTMLElement) {
  return container.querySelector(
    '[aria-label="Reset Game"]',
  ) as HTMLButtonElement
}

function cancelButton(container: HTMLElement) {
  return container.querySelector(
    '[aria-label="Cancel Game"]',
  ) as HTMLButtonElement
}

describe('HostActionsMenu inline buttons', () => {
  it('renders nothing for non-hosts', () => {
    useMeetingStore.setState({ isHost: false })
    const { container } = render(<HostActionsMenu />)
    expect(container.innerHTML).toBe('')
  })

  it('renders nothing before the game starts', () => {
    useGameStore.setState({ gameStarted: false })
    const { container } = render(<HostActionsMenu />)
    expect(container.innerHTML).toBe('')
  })

  it('submit is disabled until every player has voted', () => {
    const { container } = render(<HostActionsMenu />)
    const submit = container.querySelector(
      '[aria-label="Submit Votes"]',
    ) as HTMLButtonElement
    expect(submit.disabled).toBe(true)
  })

  it('submit sends votes when all have voted', () => {
    useGameStore.setState({
      currentVotes: new Map([
        [1, 2],
        [2, 1],
      ]),
    })
    const { container } = render(<HostActionsMenu />)
    const submit = container.querySelector(
      '[aria-label="Submit Votes"]',
    ) as HTMLButtonElement
    expect(submit.disabled).toBe(false)
    fireEvent.click(submit)
    expect(useGameStore.getState().submitVotes).toHaveBeenCalled()
  })

  it('resolve appears during the vote-result phase', () => {
    useGameStore.setState({ phase: Phase.VOTE_RESULT })
    const { container } = render(<HostActionsMenu />)
    fireEvent.click(container.querySelector('[aria-label="Resolve Votes"]')!)
    expect(useGameStore.getState().submitVoteResult).toHaveBeenCalled()
  })

  it('no submit button during the night', () => {
    useGameStore.setState({ phase: Phase.NIGHT })
    const { container } = render(<HostActionsMenu />)
    expect(container.querySelector('[aria-label="Submit Votes"]')).toBeNull()
    expect(container.querySelector('[aria-label="Resolve Votes"]')).toBeNull()
    expect(resetButton(container)).not.toBeNull()
    expect(cancelButton(container)).not.toBeNull()
  })
})

describe('HostActionsMenu confirm modals', () => {
  it('reset asks for confirmation instead of resetting', () => {
    const { container, queryByRole } = render(<HostActionsMenu />)
    fireEvent.click(resetButton(container))
    expect(useGameStore.getState().resetGame).not.toHaveBeenCalled()
    expect(queryByRole('dialog')?.textContent).toContain('Restart game?')
  })

  it('confirming the modal runs reset and closes it', () => {
    const { container, queryByRole, getByText } = render(<HostActionsMenu />)
    fireEvent.click(resetButton(container))
    fireEvent.click(getByText('Restart game'))
    expect(useGameStore.getState().resetGame).toHaveBeenCalled()
    expect(queryByRole('dialog')).toBeNull()
  })

  it('canceling the modal runs nothing and closes it', () => {
    const { container, queryByRole, getByText } = render(<HostActionsMenu />)
    fireEvent.click(cancelButton(container))
    expect(queryByRole('dialog')?.textContent).toContain('Cancel game?')
    fireEvent.click(getByText('Cancel'))
    expect(useGameStore.getState().cancelGame).not.toHaveBeenCalled()
    expect(useGameStore.getState().resetGame).not.toHaveBeenCalled()
    expect(queryByRole('dialog')).toBeNull()
  })

  it('confirming Cancel Game runs cancel and closes the modal', () => {
    const { container, queryByRole, getByText } = render(<HostActionsMenu />)
    fireEvent.click(cancelButton(container))
    fireEvent.click(getByText('Cancel game'))
    expect(useGameStore.getState().cancelGame).toHaveBeenCalled()
    expect(queryByRole('dialog')).toBeNull()
  })

  it('Escape dismisses the modal without running anything', () => {
    const { container, queryByRole } = render(<HostActionsMenu />)
    fireEvent.click(resetButton(container))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(useGameStore.getState().resetGame).not.toHaveBeenCalled()
    expect(queryByRole('dialog')).toBeNull()
  })
})
