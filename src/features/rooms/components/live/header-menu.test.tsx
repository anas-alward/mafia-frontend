import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HeaderMenu } from './header-menu'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'

const writeText = vi.fn()
const requestFullscreen = vi.fn()
const exitFullscreen = vi.fn()

let fullScreenRef: React.RefObject<HTMLDivElement | null>

function renderMenu() {
  return render(<HeaderMenu fullScreenRef={fullScreenRef} />)
}

function openMenu(container: HTMLElement) {
  fireEvent.click(container.querySelector('[aria-label="Open menu"]')!)
}

beforeEach(() => {
  localStorage.clear()
  writeText.mockClear()
  requestFullscreen.mockClear()
  exitFullscreen.mockClear()
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  })
  Object.defineProperty(document, 'fullscreenElement', {
    value: null,
    configurable: true,
  })
  document.exitFullscreen = exitFullscreen
  const el = document.createElement('div')
  el.requestFullscreen = requestFullscreen
  fullScreenRef = { current: el }
  useMeetingStore.setState({ roomId: 'ABC123' })
})

afterEach(cleanup)

describe('HeaderMenu share link', () => {
  it('opens a menu with the Share link action', () => {
    const { container, queryByRole } = renderMenu()
    expect(queryByRole('menu')).toBeNull()
    openMenu(container)
    expect(queryByRole('menu')?.textContent).toContain('Share link')
  })

  it('copies the room join link and confirms', async () => {
    writeText.mockResolvedValue(undefined)
    const { container, findByText } = renderMenu()
    openMenu(container)
    await act(async () => {
      fireEvent.click(container.querySelectorAll('[role="menuitem"]')[0])
    })
    expect(writeText).toHaveBeenCalledWith(
      `${window.location.origin}/rooms/ABC123/join`,
    )
    expect(await findByText('Link copied!')).not.toBeNull()
  })

  it('keeps the menu open when copying fails', async () => {
    writeText.mockRejectedValue(new Error('denied'))
    const { container, queryByRole } = renderMenu()
    openMenu(container)
    await act(async () => {
      fireEvent.click(container.querySelectorAll('[role="menuitem"]')[0])
    })
    expect(queryByRole('menu')?.textContent).toContain('Share link')
  })
})

describe('HeaderMenu fullscreen', () => {
  it('requests fullscreen and closes the menu', () => {
    requestFullscreen.mockResolvedValue(undefined)
    const { container, queryByRole } = renderMenu()
    openMenu(container)
    fireEvent.click(container.querySelectorAll('[role="menuitem"]')[1])
    expect(requestFullscreen).toHaveBeenCalled()
    expect(queryByRole('menu')).toBeNull()
  })

  it('offers exit while fullscreen and calls exit on select', () => {
    Object.defineProperty(document, 'fullscreenElement', {
      value: document.createElement('div'),
      configurable: true,
    })
    const { container } = renderMenu()
    act(() => {
      document.dispatchEvent(new Event('fullscreenchange'))
    })
    openMenu(container)
    const items = container.querySelectorAll('[role="menuitem"]')
    expect(items[1].textContent).toBe('Exit fullscreen')
    fireEvent.click(items[1])
    expect(exitFullscreen).toHaveBeenCalled()
  })
})
