import { useState } from 'react'
import { Crown, RotateCcw, Send, X } from 'lucide-react'
import { Phase } from '#/features/game/constants/phases'
import { useGameStore } from '#/features/game/store/game-store'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'

const orbBase =
  'relative flex items-center justify-center h-9 w-9 rounded-xl border transition-all duration-200 cursor-pointer'

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

  const [hostMenuOpen, setHostMenuOpen] = useState(false)

  if (!gameStarted || !isHost) return null

  const allVoted = alivePlayerIds.every((id) => currentVotes.has(id))
  const hostActionPending =
    (phase === Phase.DAY && allVoted) || phase === Phase.VOTE_RESULT

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setHostMenuOpen((o) => !o)}
        title="Host actions"
        className={`${orbBase} cursor-pointer`}
        style={{
          color: hostActionPending
            ? '#000'
            : hostMenuOpen
              ? 'var(--game-gold)'
              : 'var(--game-text-muted)',
          backgroundColor: hostActionPending
            ? 'var(--game-gold)'
            : hostMenuOpen
              ? 'var(--game-bg-elevated)'
              : 'transparent',
          borderColor: hostActionPending
            ? 'var(--game-gold)'
            : hostMenuOpen
              ? 'var(--game-gold)'
              : 'var(--game-border)',
        }}
        aria-label="Host actions"
      >
        <Crown className="h-4 w-4" />
      </button>

      {hostMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setHostMenuOpen(false)}
          />
          <div
            className="absolute bottom-full left-0 mb-2 z-50 w-44 rounded-xl border shadow-2xl overflow-hidden"
            style={{
              backgroundColor: 'var(--game-bg-elevated)',
              borderColor: 'var(--game-border)',
            }}
          >
            {phase === Phase.DAY && (
              <HostMenuItem
                icon={<Send className="h-3.5 w-3.5" />}
                label={`Submit Votes${alivePlayerIds.length > 0 ? ` (${currentVotes.size}/${alivePlayerIds.length})` : ''}`}
                disabled={!allVoted}
                onClick={() => {
                  submitVotes()
                  setHostMenuOpen(false)
                }}
              />
            )}
            {phase === Phase.VOTE_RESULT && (
              <HostMenuItem
                icon={<Send className="h-3.5 w-3.5" />}
                label="Resolve Votes"
                color="#F5925E"
                onClick={() => {
                  submitVoteResult()
                  setHostMenuOpen(false)
                }}
              />
            )}
            <HostMenuItem
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              label="Reset Game"
              onClick={() => {
                resetGame()
                setHostMenuOpen(false)
              }}
            />
            <HostMenuItem
              icon={<X className="h-3.5 w-3.5" />}
              label="Cancel Game"
              color="var(--game-crimson)"
              onClick={() => {
                cancelGame()
                setHostMenuOpen(false)
              }}
            />
          </div>
        </>
      )}
    </div>
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
