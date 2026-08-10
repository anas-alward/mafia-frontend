import { useMemo } from 'react'
import {
  Vote,
  Skull,
  Crosshair,
  Search,
  HeartPulse,
  Send,
  Play,
  Ban,
  Moon,
  Bomb,
  RotateCcw,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ActionType, Phase } from '#/features/game/constants'
import { useGameStore } from '#/features/game/store/game-store'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'

// ── Action visual config ──

interface ActionVisual {
  Icon: LucideIcon
  label: string
  color: string
  glow: string
}

const ACTION_VISUAL: Record<string, ActionVisual> = {
  [ActionType.VOTE]: {
    Icon: Vote,
    label: 'Vote',
    color: 'var(--game-gold)',
    glow: 'rgba(237, 184, 58, 0.3)',
  },
  [ActionType.KILL]: {
    Icon: Skull,
    label: 'Kill',
    color: 'var(--game-crimson)',
    glow: 'rgba(240, 96, 107, 0.3)',
  },
  [ActionType.HEAL]: {
    Icon: HeartPulse,
    label: 'Heal',
    color: 'var(--game-mint)',
    glow: 'rgba(77, 232, 160, 0.3)',
  },
  [ActionType.DETECT]: {
    Icon: Search,
    label: 'Detect',
    color: 'var(--game-periwinkle)',
    glow: 'rgba(143, 160, 245, 0.3)',
  },
  [ActionType.SHOOT]: {
    Icon: Crosshair,
    label: 'Shoot',
    color: '#F5925E',
    glow: 'rgba(245, 146, 94, 0.3)',
  },
  [ActionType.REVENGE]: {
    Icon: Bomb,
    label: 'Revenge',
    color: 'var(--game-crimson)',
    glow: 'rgba(240, 96, 107, 0.3)',
  },
  [ActionType.ROLEBLOCK]: {
    Icon: Ban,
    label: 'Block',
    color: '#C49EF0',
    glow: 'rgba(196, 158, 240, 0.3)',
  },
  [ActionType.SILENT]: {
    Icon: Moon,
    label: 'Skip',
    color: 'var(--game-text-muted)',
    glow: 'rgba(243, 240, 232, 0.1)',
  },
}

// ── Props ──

interface GameActionBarProps {
  selectedPlayerId: number | null
  preGameSelectedIds: Set<number>
  isPreGameHost: boolean
  onStartGame: (playerIds: number[]) => void
}

export default function GameActionBar({
  selectedPlayerId,
  preGameSelectedIds,
  isPreGameHost,
  onStartGame,
}: GameActionBarProps) {
  const gameStarted = useGameStore((s) => s.gameStarted)
  const phase = useGameStore((s) => s.phase)
  const requiredActions = useGameStore((s) => s.requiredActions)
  const alivePlayerIds = useGameStore((s) => s.alivePlayerIds)
  const currentVotes = useGameStore((s) => s.currentVotes)
  const castVote = useGameStore((s) => s.castVote)
  const killPlayer = useGameStore((s) => s.killPlayer)
  const healPlayer = useGameStore((s) => s.healPlayer)
  const detectPlayer = useGameStore((s) => s.detectPlayer)
  const shootPlayer = useGameStore((s) => s.shootPlayer)
  const silentAction = useGameStore((s) => s.silentAction)
  const revengeKill = useGameStore((s) => s.revengeKill)
  const roleblockPlayer = useGameStore((s) => s.roleblockPlayer)
  const submitVotes = useGameStore((s) => s.submitVotes)
  const submitVoteResult = useGameStore((s) => s.submitVoteResult)
  const resetGame = useGameStore((s) => s.resetGame)
  const cancelGame = useGameStore((s) => s.cancelGame)
  const isHost = useMeetingStore((s) => s.isHost)

  const allVoted = useMemo(
    () => alivePlayerIds.every((id) => currentVotes.has(id)),
    [alivePlayerIds, currentVotes],
  )

  const totalPlayers = preGameSelectedIds.size
  const canStart = totalPlayers >= 6

  const handleAction = (actionType: string) => {
    if (actionType === ActionType.SILENT) {
      silentAction()
      return
    }
    if (selectedPlayerId == null) return

    switch (actionType) {
      case ActionType.VOTE:
        castVote(selectedPlayerId)
        break
      case ActionType.KILL:
        killPlayer(selectedPlayerId)
        break
      case ActionType.HEAL:
        healPlayer(selectedPlayerId)
        break
      case ActionType.DETECT:
        detectPlayer(selectedPlayerId)
        break
      case ActionType.SHOOT:
        shootPlayer(selectedPlayerId)
        break
      case ActionType.REVENGE:
        revengeKill(selectedPlayerId)
        break
      case ActionType.ROLEBLOCK:
        roleblockPlayer(selectedPlayerId)
        break
    }
  }

  const orbBase =
    'relative flex items-center justify-center h-10 w-10 rounded-xl border transition-all duration-300'

  return (
    <div className="flex flex-col gap-1.5">
      {/* Pre-game: Start Game (host only) */}
      {!gameStarted && isPreGameHost && (
        <button
          type="button"
          disabled={!canStart}
          onClick={() => {
            const playerIds = Array.from(preGameSelectedIds).map(Number)
            if (playerIds.length >= 6) onStartGame(playerIds)
          }}
          title={`Start Game (${totalPlayers}/6)`}
          className={`${orbBase} ${
            canStart ? 'cursor-pointer' : 'cursor-not-allowed'
          }`}
          style={{
            color: canStart ? 'var(--game-gold)' : 'var(--game-text-muted)',
            backgroundColor: canStart
              ? 'rgba(237, 184, 58, 0.1)'
              : 'transparent',
            borderColor: canStart
              ? 'rgba(237, 184, 58, 0.3)'
              : 'var(--game-border)',
          }}
        >
          <Play className="h-4 w-4" />
        </button>
      )}

      {/* In-game: required actions as ability orbs */}
      {gameStarted &&
        requiredActions.map((action) => {
          const visual = ACTION_VISUAL[action.action_type]
          if (!visual) return null

          const needsTarget = action.action_type !== ActionType.SILENT
          const targetInOptions =
            selectedPlayerId != null &&
            action.target_options.includes(selectedPlayerId)
          const hasValidTarget = needsTarget
            ? selectedPlayerId != null && targetInOptions
            : true
          const disabled = needsTarget ? !hasValidTarget : false

          return (
            <button
              key={action.action_type}
              type="button"
              disabled={disabled}
              onClick={() => handleAction(action.action_type)}
              title={`${visual.label}${needsTarget && !hasValidTarget ? ' (select a valid target)' : ''}`}
              className={`${orbBase} ${!disabled ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              style={{
                color: disabled ? 'var(--game-text-muted)' : visual.color,
                backgroundColor: disabled
                  ? 'transparent'
                  : `${visual.glow.replace('0.25', '0.07')}`,
                borderColor: disabled
                  ? 'var(--game-border)'
                  : visual.glow.replace('0.25', '0.25'),
              }}
            >
              <visual.Icon className="h-4 w-4" />
            </button>
          )
        })}

      {/* Separator before host actions */}
      {gameStarted &&
        isHost &&
        (phase === Phase.DAY || phase === Phase.VOTE_RESULT) && (
          <div
            className="my-1 border-t"
            style={{ borderColor: 'var(--game-border)' }}
          />
        )}

      {/* Host: Submit votes */}
      {gameStarted && phase === Phase.DAY && isHost && (
        <button
          type="button"
          disabled={!allVoted}
          onClick={submitVotes}
          title={`Submit Votes${alivePlayerIds.length > 0 ? ` (${currentVotes.size}/${alivePlayerIds.length})` : ''}`}
          className={`${orbBase} ${
            allVoted ? 'cursor-pointer' : 'cursor-not-allowed'
          }`}
          style={{
            color: allVoted ? 'var(--game-gold)' : 'var(--game-text-muted)',
            backgroundColor: allVoted
              ? 'rgba(237, 184, 58, 0.08)'
              : 'transparent',
            borderColor: allVoted
              ? 'rgba(237, 184, 58, 0.3)'
              : 'var(--game-border)',
          }}
        >
          <Send className="h-4 w-4" />
        </button>
      )}

      {/* Host: Resolve vote result */}
      {gameStarted && phase === Phase.VOTE_RESULT && isHost && (
        <button
          type="button"
          onClick={submitVoteResult}
          title="Resolve"
          className={`${orbBase} cursor-pointer`}
          style={{
            color: '#F5925E',
            backgroundColor: 'rgba(245, 146, 94, 0.08)',
            borderColor: 'rgba(245, 146, 94, 0.3)',
          }}
        >
          <Send className="h-4 w-4" />
        </button>
      )}

      {/* Separator before game management */}
      {gameStarted && isHost && (
        <div
          className="my-1 border-t"
          style={{ borderColor: 'var(--game-border)' }}
        />
      )}

      {/* Host: Reset game */}
      {gameStarted && isHost && (
        <button
          type="button"
          onClick={resetGame}
          title="Reset Game"
          className={`${orbBase} cursor-pointer`}
          style={{
            color: 'var(--game-text-muted)',
            backgroundColor: 'transparent',
            borderColor: 'var(--game-border)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--game-text-primary)'
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--game-text-muted)'
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      )}

      {/* Host: Cancel game */}
      {gameStarted && isHost && (
        <button
          type="button"
          onClick={cancelGame}
          title="Cancel Game"
          className={`${orbBase} cursor-pointer`}
          style={{
            color: 'var(--game-crimson)',
            backgroundColor: 'transparent',
            borderColor: 'rgba(240, 96, 107, 0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(240, 96, 107, 0.12)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
