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
  type LucideIcon,
} from 'lucide-react'
import { ActionType, Phase } from '#/features/game/constants'
import { useGameStore } from '#/features/game/store/game-store'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'

// ── Action visual config ──

interface ActionVisual {
  Icon: LucideIcon
  label: string
  colorClasses: string
}

const ACTION_VISUAL: Record<string, ActionVisual> = {
  [ActionType.VOTE]: {
    Icon: Vote,
    label: 'Vote',
    colorClasses:
      'text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 border-amber-500/30 data-[active=true]:bg-amber-500/20 data-[active=true]:text-amber-300',
  },
  [ActionType.KILL]: {
    Icon: Skull,
    label: 'Kill',
    colorClasses:
      'text-red-400 hover:bg-red-500/20 hover:text-red-300 border-red-500/30 data-[active=true]:bg-red-500/20 data-[active=true]:text-red-300',
  },
  [ActionType.HEAL]: {
    Icon: HeartPulse,
    label: 'Heal',
    colorClasses:
      'text-green-400 hover:bg-green-500/20 hover:text-green-300 border-green-500/30 data-[active=true]:bg-green-500/20 data-[active=true]:text-green-300',
  },
  [ActionType.DETECT]: {
    Icon: Search,
    label: 'Detect',
    colorClasses:
      'text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 border-blue-500/30 data-[active=true]:bg-blue-500/20 data-[active=true]:text-blue-300',
  },
  [ActionType.SHOOT]: {
    Icon: Crosshair,
    label: 'Shoot',
    colorClasses:
      'text-orange-400 hover:bg-orange-500/20 hover:text-orange-300 border-orange-500/30 data-[active=true]:bg-orange-500/20 data-[active=true]:text-orange-300',
  },
  [ActionType.REVENGE]: {
    Icon: Bomb,
    label: 'Revenge',
    colorClasses:
      'text-red-400 hover:bg-red-500/20 hover:text-red-300 border-red-500/30 data-[active=true]:bg-red-500/20 data-[active=true]:text-red-300',
  },
  [ActionType.ROLEBLOCK]: {
    Icon: Ban,
    label: 'Block',
    colorClasses:
      'text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 border-purple-500/30 data-[active=true]:bg-purple-500/20 data-[active=true]:text-purple-300',
  },
  [ActionType.SILENT]: {
    Icon: Moon,
    label: 'Skip',
    colorClasses:
      'text-[#a1a1aa] hover:bg-white/10 hover:text-[#f4f4f5] border-white/10 data-[active=true]:bg-white/10 data-[active=true]:text-[#f4f4f5]',
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
          className={`relative flex items-center justify-center h-10 w-10 rounded-xl border transition-colors ${
            canStart
              ? 'text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 border-amber-500/30 cursor-pointer'
              : 'text-[#71717a] border-white/5 cursor-not-allowed'
          }`}
        >
          <Play className="h-4 w-4" />
        </button>
      )}

      {/* In-game: required actions as icon buttons */}
      {gameStarted &&
        requiredActions.map((action) => {
          const visual = ACTION_VISUAL[action.action_type]
          if (!visual) return null

          const needsTarget = action.action_type !== ActionType.SILENT
          const targetInOptions =
            selectedPlayerId != null && action.target_options.includes(selectedPlayerId)
          const hasValidTarget = needsTarget ? selectedPlayerId != null && targetInOptions : true
          const disabled = needsTarget ? !hasValidTarget : false

          return (
            <button
              key={action.action_type}
              type="button"
              disabled={disabled}
              onClick={() => handleAction(action.action_type)}
              title={`${visual.label}${needsTarget && !hasValidTarget ? ' (select a valid target)' : ''}`}
              className={`relative flex items-center justify-center h-10 w-10 rounded-xl border transition-colors ${
                disabled
                  ? 'text-[#71717a] border-white/5 cursor-not-allowed'
                  : `cursor-pointer ${visual.colorClasses}`
              }`}
            >
              <visual.Icon className="h-4 w-4" />
            </button>
          )
        })}

      {/* Separator before host actions */}
      {gameStarted && isHost && (phase === Phase.DAY || phase === Phase.VOTE_RESULT) && (
        <div className="my-1 border-t border-white/5" />
      )}

      {/* Host: Submit votes */}
      {gameStarted && phase === Phase.DAY && isHost && (
        <button
          type="button"
          disabled={!allVoted}
          onClick={submitVotes}
          title={`Submit Votes${alivePlayerIds.length > 0 ? ` (${currentVotes.size}/${alivePlayerIds.length})` : ''}`}
          className={`relative flex items-center justify-center h-10 w-10 rounded-xl border transition-colors ${
            allVoted
              ? 'text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 border-amber-500/30 cursor-pointer'
              : 'text-[#71717a] border-white/5 cursor-not-allowed'
          }`}
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
          className="relative flex items-center justify-center h-10 w-10 rounded-xl border text-orange-400 hover:bg-orange-500/20 hover:text-orange-300 border-orange-500/30 transition-colors cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
