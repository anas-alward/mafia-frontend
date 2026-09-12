import { useState } from 'react'
import { RotateCcw, Send, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Phase } from '#/features/game/constants/phases'
import { useGameStore } from '#/features/game/store/game-store'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { ConfirmDialog } from '#/features/rooms/components/live/confirm-dialog'

type PendingAction = 'reset' | 'cancel' | null

const orbBase =
  'flex items-center justify-center h-9 w-9 rounded-xl border transition-all duration-200'

/**
 * In-game host buttons, rendered inline in the control bar center next to
 * the media controls (same orb design as StartGameButton). Submit/Resolve
 * only appears in its phase; Reset and Cancel always show in-game and ask
 * for confirmation through a modal.
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

  // The phase's submit action. Only day and vote-result have one —
  // during the night there is nothing to submit.
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

  const runPending = () => {
    if (pendingAction === 'reset') resetGame()
    if (pendingAction === 'cancel') cancelGame()
    setPendingAction(null)
  }

  const pending = pendingAction ? pendingCopy[pendingAction] : null

  return (
    <>
      <div className="flex items-center gap-1.5">
        {primary && (
          <button
            type="button"
            disabled={!primary.ready}
            onClick={primary.run}
            title={primary.hint}
            aria-label={primary.label}
            className={`${orbBase} ${
              primary.ready
                ? 'cursor-pointer hover:bg-white/[0.04]'
                : 'cursor-not-allowed opacity-50'
            }`}
            style={{
              color: primary.ready
                ? 'var(--game-gold)'
                : 'var(--game-text-muted)',
              backgroundColor: 'rgba(237, 184, 58, 0.1)',
              borderColor: 'rgba(237, 184, 58, 0.3)',
            }}
          >
            <Send className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={() => setPendingAction('reset')}
          title={t('room.hostMenu.resetGame')}
          aria-label={t('room.hostMenu.resetGame')}
          className={`${orbBase} cursor-pointer hover:bg-white/[0.04]`}
          style={{
            color: 'var(--game-gold)',
            backgroundColor: 'rgba(237, 184, 58, 0.1)',
            borderColor: 'rgba(237, 184, 58, 0.3)',
          }}
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setPendingAction('cancel')}
          title={t('room.hostMenu.cancelGame')}
          aria-label={t('room.hostMenu.cancelGame')}
          className={`${orbBase} cursor-pointer hover:bg-white/[0.04]`}
          style={{
            color: 'var(--game-crimson)',
            backgroundColor: 'rgba(240, 96, 107, 0.12)',
            borderColor: 'rgba(240, 96, 107, 0.35)',
          }}
        >
          <X className="h-4 w-4" />
        </button>
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
