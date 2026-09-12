import { useState } from 'react'
import { ChevronDown, RotateCcw, Send, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Phase } from '#/features/game/constants/phases'
import { useGameStore } from '#/features/game/store/game-store'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { ConfirmDialog } from '#/features/rooms/components/live/confirm-dialog'

type PendingAction = 'reset' | 'cancel' | null

/**
 * Host split button. Follows the StartGameButton orb design (h-9,
 * rounded-xl, gold-tinted border) so the pre-game and in-game host
 * controls look like the same control. The primary section executes the
 * current phase's default action (submit/resolve votes); the chevron
 * opens the alternatives dropdown.
 */
export function HostActionsMenu() {
  const { t } = useTranslation()
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

  const pendingCopy = {
    reset: {
      title: t('room.hostMenu.confirmResetTitle'),
      description: t('room.hostMenu.confirmResetDesc'),
      confirmLabel: t('room.hostMenu.confirmResetLabel'),
      danger: false,
    },
    cancel: {
      title: t('room.hostMenu.confirmCancelTitle'),
      description: t('room.hostMenu.confirmCancelDesc'),
      confirmLabel: t('room.hostMenu.confirmCancelLabel'),
      danger: true,
    },
  } as const

  if (!gameStarted || !isHost) return null

  const allVoted = alivePlayerIds.every((id) => currentVotes.has(id))

  // The phase's default action for the primary section.
  const primary =
    phase === Phase.DAY
      ? {
          label: t('room.hostMenu.submitVotes'),
          hint: t('room.hostMenu.waitingVotes', {
            count: currentVotes.size,
            total: alivePlayerIds.length,
          }),
          ready: allVoted,
          run: submitVotes,
        }
      : phase === Phase.VOTE_RESULT
        ? {
            label: t('room.hostMenu.resolveVotes'),
            hint: t('room.hostMenu.resolveHint'),
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

  const pending = pendingAction ? pendingCopy[pendingAction] : null

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
          className={`flex items-center justify-center w-9 rounded-s-xl transition-all duration-200 ${
            ready
              ? 'cursor-pointer hover:bg-white/[0.04]'
              : 'cursor-not-allowed opacity-50'
          }`}
          style={{
            color: ready ? 'var(--game-gold)' : 'var(--game-text-muted)',
          }}
          aria-label={
            primary
              ? t('room.hostMenu.primaryAction', {
                  label: primary.label,
                  defaultValue: '{{label}} (primary)',
                })
              : t('room.hostMenu.menu')
          }
        >
          <Send className="h-4 w-4" />
        </button>

        {/* Chevron — alternatives dropdown */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center justify-center w-7 border-s rounded-e-xl transition-colors duration-200 cursor-pointer hover:bg-white/[0.04]"
          style={{ borderColor: 'rgba(237, 184, 58, 0.3)' }}
          aria-label={t('room.hostMenu.menu')}
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
              className="absolute bottom-full start-0 mb-2 z-50 w-44 rounded-xl border shadow-2xl overflow-hidden py-1"
              style={{
                backgroundColor: 'var(--game-bg-elevated)',
                borderColor: 'var(--game-border)',
              }}
            >
              <HostMenuItem
                icon={<RotateCcw className="h-3.5 w-3.5" />}
                label={t('room.hostMenu.resetGame')}
                onClick={() => askConfirm('reset')}
              />
              <HostMenuItem
                icon={<X className="h-3.5 w-3.5" />}
                label={t('room.hostMenu.cancelGame')}
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
      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-start transition-colors ${
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
