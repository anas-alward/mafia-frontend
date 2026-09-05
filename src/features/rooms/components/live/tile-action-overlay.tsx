import { useMemo } from 'react'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Vote,
  Skull,
  HeartPulse,
  Search,
  Crosshair,
  Bomb,
  Ban,
} from 'lucide-react'
import { useGameStore } from '#/features/game/store/game-store'
import { useAuthStore } from '#/features/auth/store/auth-store'
import { ActionType } from '#/features/game/constants'

interface ActionVisual {
  Icon: LucideIcon
  label: string
  color: string
}

const ACTION_VISUAL: Partial<Record<string, ActionVisual>> = {
  [ActionType.VOTE]: {
    Icon: Vote,
    label: 'Vote',
    color: 'var(--game-gold)',
  },
  [ActionType.KILL]: {
    Icon: Skull,
    label: 'Kill',
    color: 'var(--game-crimson)',
  },
  [ActionType.HEAL]: {
    Icon: HeartPulse,
    label: 'Heal',
    color: 'var(--game-mint)',
  },
  [ActionType.DETECT]: {
    Icon: Search,
    label: 'Detect',
    color: 'var(--game-periwinkle)',
  },
  [ActionType.SHOOT]: {
    Icon: Crosshair,
    label: 'Shoot',
    color: '#F5925E',
  },
  [ActionType.REVENGE]: {
    Icon: Bomb,
    label: 'Revenge',
    color: 'var(--game-crimson)',
  },
  [ActionType.SILENCE]: {
    Icon: Ban,
    label: 'Silence',
    color: '#C49EF0',
  },
}

const orbBase =
  'relative flex items-center justify-center h-9 w-9 rounded-xl border transition-all duration-200 cursor-pointer'

interface TileActionOverlayProps {
  participant: any
  children: ReactNode
}

export function TileActionOverlay({
  participant,
  children,
}: TileActionOverlayProps) {
  const gameStarted = useGameStore((s) => s.gameStarted)
  const alivePlayerIds = useGameStore((s) => s.alivePlayerIds)
  const requiredActions = useGameStore((s) => s.requiredActions)
  const castVote = useGameStore((s) => s.castVote)
  const killPlayer = useGameStore((s) => s.killPlayer)
  const healPlayer = useGameStore((s) => s.healPlayer)
  const detectPlayer = useGameStore((s) => s.detectPlayer)
  const shootPlayer = useGameStore((s) => s.shootPlayer)
  const revengeKill = useGameStore((s) => s.revengeKill)
  const silencePlayer = useGameStore((s) => s.silencePlayer)

  const currentUser = useAuthStore((s) => s.user)

  const tileUserId: number | null = participant.identity
    ? Number(participant.identity)
    : null
  const isAlive = tileUserId != null && alivePlayerIds.includes(tileUserId)
  const isLocal =
    tileUserId != null &&
    currentUser != null &&
    tileUserId === Number(currentUser.id)
  const currentUserId = currentUser ? Number(currentUser.id) : null
  const myAlive =
    currentUserId != null && alivePlayerIds.includes(currentUserId)

  const tileActions = useMemo(() => {
    if (!gameStarted || !isAlive || !myAlive || isLocal) {
      return []
    }
    const result: { actionType: string; visual: ActionVisual }[] = []
    for (const a of requiredActions) {
      if (!a.target_options.includes(tileUserId)) continue
      const visual = ACTION_VISUAL[a.action_type]
      if (visual) result.push({ actionType: a.action_type, visual })
    }
    return result
  }, [gameStarted, isAlive, myAlive, isLocal, tileUserId, requiredActions])

  const handleTileAction = (actionType: string) => {
    if (tileUserId == null) return
    switch (actionType) {
      case ActionType.VOTE:
        castVote(tileUserId)
        break
      case ActionType.KILL:
        killPlayer(tileUserId)
        break
      case ActionType.HEAL:
        healPlayer(tileUserId)
        break
      case ActionType.DETECT:
        detectPlayer(tileUserId)
        break
      case ActionType.SHOOT:
        shootPlayer(tileUserId)
        break
      case ActionType.REVENGE:
        revengeKill(tileUserId)
        break
      case ActionType.SILENCE:
        silencePlayer(tileUserId)
        break
    }
  }

  return (
    <div className="group relative h-full w-full rounded-lg overflow-hidden">
      {children}

      {tileActions.length > 0 && (
        <div
          className="absolute inset-0 z-25 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ backgroundColor: 'rgba(27, 25, 34, 0.25)' }}
        >
          {tileActions.map(({ actionType, visual }) => (
            <button
              key={actionType}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleTileAction(actionType)
              }}
              title={visual.label}
              className={orbBase}
              style={{
                color: visual.color,
                backgroundColor: `color-mix(in srgb, ${visual.color} 30%, #131314)`,
                borderColor: `color-mix(in srgb, ${visual.color} 60%, #131314)`,
              }}
            >
              <visual.Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
