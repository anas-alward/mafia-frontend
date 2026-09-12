import { useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Check,
  EllipsisVertical,
  Link2,
  Maximize,
  Minimize,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'

interface HeaderMenuAction {
  label: string
  Icon: LucideIcon
  /** Success tint (e.g. after copying). */
  highlight?: boolean
  run: () => void | Promise<void>
}

interface HeaderMenuProps {
  fullScreenRef: React.RefObject<HTMLDivElement | null>
}

/**
 * Hamburger menu in the header's top-right corner. Room-level actions
 * live here so the bars stay compact — add new entries to the actions
 * list below.
 */
export function HeaderMenu({ fullScreenRef }: HeaderMenuProps) {
  const { t } = useTranslation()
  const roomId = useMeetingStore((s) => s.roomId)

  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const shareLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/rooms/${roomId}/join`,
      )
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setMenuOpen(false)
      }, 900)
    } catch {
      // clipboard unavailable — keep the menu open so the user can retry
    }
  }

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      fullScreenRef.current?.requestFullscreen()
    }
    setMenuOpen(false)
  }

  const actions: HeaderMenuAction[] = [
    {
      label: copied ? t('room.menu.copied') : t('room.menu.share'),
      Icon: copied ? Check : Link2,
      highlight: copied,
      run: shareLink,
    },
    {
      label: isFullscreen
        ? t('room.menu.exitFullscreen')
        : t('room.menu.enterFullscreen'),
      Icon: isFullscreen ? Minimize : Maximize,
      run: toggleFullscreen,
    },
  ]

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        className="p-1.5 rounded-lg transition-all cursor-pointer"
        style={{
          backgroundColor: menuOpen ? 'var(--game-bg-elevated)' : 'transparent',
          color: menuOpen
            ? 'var(--game-text-primary)'
            : 'var(--game-text-muted)',
        }}
        aria-label={t('room.menu.open')}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
      >
        <EllipsisVertical className="h-4 w-4" />
      </button>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div
            role="menu"
            className="absolute end-0 top-full mt-2 z-50 w-44 rounded-xl border shadow-2xl overflow-hidden py-1"
            style={{
              backgroundColor: 'var(--game-bg-elevated)',
              borderColor: 'var(--game-border)',
            }}
          >
            {actions.map(({ label, Icon, highlight, run }) => (
              <button
                key={label}
                type="button"
                role="menuitem"
                onClick={() => run()}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-start transition-colors cursor-pointer hover:bg-white/[0.06]"
                style={{
                  color: highlight
                    ? 'var(--game-mint)'
                    : 'var(--game-text-primary)',
                }}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="flex-1">{label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
