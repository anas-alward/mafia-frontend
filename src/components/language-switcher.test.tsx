import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import i18n from '#/i18n'
import { LanguageSwitcher } from './language-switcher'

function openMenu(name: string | RegExp = 'Language') {
  // Radix menus open on pointerdown, not click
  fireEvent.pointerDown(screen.getByRole('button', { name }))
}

beforeEach(async () => {
  localStorage.clear()
  await i18n.changeLanguage('en')
  document.documentElement.dir = 'ltr'
})

afterEach(async () => {
  cleanup()
  await i18n.changeLanguage('en')
  document.documentElement.dir = 'ltr'
})

describe('LanguageSwitcher', () => {
  it('renders the trigger and both languages', () => {
    render(<LanguageSwitcher />)
    openMenu()
    expect(screen.getByText('English')).not.toBeNull()
    expect(screen.getByText('Arabic')).not.toBeNull()
  })

  it('switches to Arabic with RTL direction', async () => {
    render(<LanguageSwitcher />)
    openMenu()
    await act(async () => {
      fireEvent.click(screen.getByText('Arabic'))
    })
    expect(i18n.language).toBe('ar')
    expect(document.documentElement.dir).toBe('rtl')
  })

  it('switches back to English with LTR direction', async () => {
    await act(async () => {
      await i18n.changeLanguage('ar')
    })
    render(<LanguageSwitcher />)
    openMenu('اللغة')
    await act(async () => {
      fireEvent.click(screen.getByText('English'))
    })
    expect(i18n.language).toBe('en')
    expect(document.documentElement.dir).toBe('ltr')
  })
})
