import { useState } from 'react'
import { ChevronDown, RotateCcw, Send, X } from 'lucide-react'
import { Phase } from '#/features/game/constants/phases'
import { useGameStore } from '#/features/game/store/game-store'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { ConfirmDialog } from '#/features/rooms/components/live/confirm-dialog'

type PendingAction = 'reset' | 'cancel' | null

const PENDING_COPY = {
  reset: {
    title: 'Restart game?',
    description:
      'Roles will be redealt and the current round will be discarded.',
    confirmLabel: 'Restart game',
    danger: false,
  },
  cancel: {
    title: 'Cancel game?',
    description: 'The game ends now and everyone returns to the lobby.',
    confirmLabel: 'Cancel game',
    danger: true,
  },
} as const

/**
 * Host split button. Follows the StartGameButton orb design (h-9,
 * rounded-xl, gold-tinted border) so the pre-game and in-game host
 * controls look like the same control. The primary section executes the
 * current phase's default action (submit/resolve votes); the chevron
 * opens the alternatives dropdown.
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
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)

  if (!gameStarted || !isHost) return null

  const allVoted = alivePlayerIds.every((id) => currentVotes.has(id))

  // The phase's default action for the primary section.
  const primary =
    phase === Phase.DAY
      ? {
          label: 'Submit Votes',
          hint: `Waiting for all votes (${currentVotes.size}/${alivePlayerIds.length})`,
          ready: allVoted,
          run: submitVotes,
        }
      : phase === Phase.VOTE_RESULT
        ? {
            label: 'Resolve Votes',
            hint: 'Resolve votes',
            ready: true,
            run: submitVoteResult,
          }
        : null

  const ready = primary != null && primary.ready

  const askConfirm = (action: Exclude<PendingAction, null>) => {
    setPendingAction(action)
    setMenuOpen(false)
  }

  const runPending = () => {
    if (pendingAction === 'reset') resetGame()
    if (pendingAction === 'cancel') cancelGame()
    setPendingAction(null)
  }

  const pending = pendingAction ? PENDING_COPY[pendingAction] : null

  return (
    <>
      <div
        className="relative flex items-stretch h-9 rounded-xl border transition-all duration-200"
        style={{
          color: 'var(--game-gold)',
          backgroundColor: 'rgba(237, 184, 58, 0.1)',
          borderColor: 'rgba(237, 184, 58, 0.3)',
        }}
      >
        {/* Primary — phase's default action */}
        <button
          type="button"
          disabled={primary == null || !primary.ready}
          onClick={() => {
            primary?.run()
            setMenuOpen(false)
          }}
          title={primary ? primary.hint : undefined}
          className={`flex items-center justify-center w-9 rounded-l-xl transition-all duration-200 ${
            ready
              ? 'cursor-pointer hover:bg-white/[0.04]'
              : 'cursor-not-allowed opacity-50'
          }`}
          style={{
            color: ready ? 'var(--game-gold)' : 'var(--game-text-muted)',
          }}
          aria-label={primary ? `${primary.label} (primary)` : 'Host actions'}
        >
          <Send className="h-4 w-4" />
        </button>

        {/* Chevron — alternatives dropdown */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center justify-center w-7 border-l rounded-r-xl transition-colors duration-200 cursor-pointer hover:bg-white/[0.04]"
          style={{ borderColor: 'rgba(237, 184, 58, 0.3)' }}
          aria-label="Host actions menu"
          aria-expanded={menuOpen}
        >
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${
              menuOpen ? 'rotate-180' : ''
            }`}
            style={{
              color: menuOpen ? 'var(--game-gold)' : 'var(--game-text-muted)',
            }}
          />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
            />
            <div
              className="absolute bottom-full left-0 mb-2 z-50 w-44 rounded-xl border shadow-2xl overflow-hidden py-1"
              style={{
                backgroundColor: 'var(--game-bg-elevated)',
                borderColor: 'var(--game-border)',
              }}
            >
              <HostMenuItem
                icon={<RotateCcw className="h-3.5 w-3.5" />}
                label="Reset Game"
                onClick={() => askConfirm('reset')}
              />
              <HostMenuItem
                icon={<X className="h-3.5 w-3.5" />}
                label="Cancel Game"
                color="var(--game-crimson)"
                onClick={() => askConfirm('cancel')}
              />
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={pending != null}
        title={pending?.title ?? ''}
        description={pending?.description ?? ''}
        confirmLabel={pending?.confirmLabel ?? ''}
        danger={pending?.danger ?? false}
        onConfirm={runPending}
        onCancel={() => setPendingAction(null)}
      />
    </>
  )
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
