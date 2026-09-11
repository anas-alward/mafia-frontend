import { useState } from 'react'
import { ChevronDown, RotateCcw, Send, X } from 'lucide-react'
import { Phase } from '#/features/game/constants/phases'
import { useGameStore } from '#/features/game/store/game-store'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'

/**
 * Host split button. The primary section executes the current phase's
 * default action (submit/resolve votes); the chevron opens a dropdown
 * with the alternative actions (reset / cancel).
 */
export function HostActionsMenu() {
  const gameStarted = useGameStore((s) => s.gameStarted)
  const phase = useGameStore((s) => s.phase)
  const alivePlayerIds = useGameStore((s) => s.alivePlayerIds)
  const currentVotes = useGameStore((s) => s.currentVotes)
  const submitVotes = useGameStore((s) => s.submitVotes)
  const submitVoteResult = useGameStore((s) => s.submitVoteResult)
  const resetGame = useGameStore((s) => s.resetGame)
  const cancelGame = useGameStore((s) => s.cancelGame)
  const isHost = useMeetingStore((s) => s.isHost)

  const [menuOpen, setMenuOpen] = useState(false)

  if (!gameStarted || !isHost) return null

  const allVoted = alivePlayerIds.every((id) => currentVotes.has(id))

  // The phase's default action for the primary section.
  const primary =
    phase === Phase.DAY
      ? {
          label: 'Submit Votes',
          hint: `Waiting for all votes (${currentVotes.size}/${alivePlayerIds.length})`,
          disabled: !allVoted,
          run: submitVotes,
        }
      : phase === Phase.VOTE_RESULT
        ? {
            label: 'Resolve Votes',
            hint: 'Resolve votes',
            disabled: false,
            run: submitVoteResult,
          }
        : null

  const isActive = primary != null && !primary.disabled

  return (
    <div className="relative flex items-stretch">
      {/* Primary — phase's default action */}
      <button
        type="button"
        disabled={primary == null || primary.disabled}
        onClick={() => {
          primary?.run()
          setMenuOpen(false)
        }}
        title={primary ? (isActive ? primary.label : primary.hint) : undefined}
        className={`flex items-center justify-center w-10 rounded-l-xl border border-r-0 transition-all duration-200 ${
          isActive ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
        }`}
        style={{
          color: isActive ? '#000' : 'var(--game-text-muted)',
          backgroundColor: isActive
            ? 'var(--game-gold)'
            : hostMenuBg(menuOpen),
          borderColor: isActive
            ? 'var(--game-gold)'
            : menuOpen
              ? 'var(--game-gold)'
              : 'var(--game-border)',
        }}
        aria-label={primary ? `${primary.label} (primary)` : 'Host actions'}
      >
        <Send className="h-4 w-4" />
      </button>

      {/* Chevron — alternatives dropdown */}
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        className="flex items-center justify-center w-6 rounded-r-xl border transition-all duration-200 cursor-pointer"
        style={{
          color: menuOpen ? 'var(--game-gold)' : 'var(--game-text-muted)',
          backgroundColor: hostMenuBg(menuOpen),
          borderColor: menuOpen ? 'var(--game-gold)' : 'var(--game-border)',
        }}
        aria-label="Host actions menu"
        aria-expanded={menuOpen}
      >
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${
            menuOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="absolute bottom-full left-0 mb-2 z-50 w-44 rounded-xl border shadow-2xl overflow-hidden"
            style={{
              backgroundColor: 'var(--game-bg-elevated)',
              borderColor: 'var(--game-border)',
            }}
          >
            <HostMenuItem
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              label="Reset Game"
              onClick={() => {
                resetGame()
                setMenuOpen(false)
              }}
            />
            <HostMenuItem
              icon={<X className="h-3.5 w-3.5" />}
              label="Cancel Game"
              color="var(--game-crimson)"
              onClick={() => {
                cancelGame()
                setMenuOpen(false)
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}

function hostMenuBg(open: boolean): string {
  return open ? 'var(--game-bg-elevated)' : 'transparent'
}

function HostMenuItem({
  icon,
  label,
  onClick,
  disabled = false,
  color = 'var(--game-text-primary)',
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  color?: string
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-left transition-colors ${
        disabled
          ? 'opacity-40 cursor-not-allowed'
          : 'cursor-pointer hover:bg-white/[0.06]'
      }`}
      style={{ color }}
    >
      {icon}
      <span className="flex-1">{label}</span>
    </button>
  )
}
