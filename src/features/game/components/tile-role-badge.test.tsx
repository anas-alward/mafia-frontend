import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { TileRoleBadge } from './tile-role-badge'
import { useGameStore } from '#/features/game/store/game-store'

beforeEach(() => {
  localStorage.clear()
  useGameStore.setState({
    gameStarted: true,
    myRoleCode: 'doctor',
    mafiaMemberRoles: { 2: 'godfather' },
  })
})

afterEach(cleanup)

describe('TileRoleBadge', () => {
  it('renders the role icon for the local player', () => {
    const { container } = render(
      <TileRoleBadge userId={1} isLocal isMafia={false} />,
    )
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('renders nothing without a known role', () => {
    useGameStore.setState({ myRoleCode: null })
    const { container } = render(
      <TileRoleBadge userId={1} isLocal isMafia={false} />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders nothing when the game has not started', () => {
    useGameStore.setState({ gameStarted: false })
    const { container } = render(
      <TileRoleBadge userId={1} isLocal isMafia={false} />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders the mafia role icon for a teammate', () => {
    useGameStore.setState({ myRoleCode: 'godfather' })
    const { container } = render(
      <TileRoleBadge userId={2} isLocal={false} isMafia />,
    )
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('renders nothing for an unknown role code', () => {
    useGameStore.setState({ myRoleCode: 'nonexistent_role' })
    const { container } = render(
      <TileRoleBadge userId={1} isLocal isMafia={false} />,
    )
    expect(container.innerHTML).toBe('')
  })
})
