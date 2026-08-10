import { useEffect, useRef, useMemo } from 'react'
import { useRealtimeKitSelector } from '@cloudflare/realtimekit-react'
import {
  RtkAudioVisualizer,
  RtkNameTag,
} from '@cloudflare/realtimekit-react-ui'
import type { LucideIcon } from 'lucide-react'
import {
  User,
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
import {
  ROLE_REGISTRY,
  ROLE_ICON_MAP,
  Team,
  ActionType,
} from '#/features/game/constants'

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
}

// ── Props ──

interface LiveParticipantTileProps {
  participant: any
  isSelected: boolean
  isSelectable: boolean
  onSelect: (userId: number) => void
}

export default function LiveParticipantTile({
  participant,
  isSelected,
  isSelectable,
  onSelect,
}: LiveParticipantTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoEnabled = useRealtimeKitSelector(() => participant.videoEnabled)
  const videoTrack = useRealtimeKitSelector(() => participant.videoTrack)
  const isSpeaking = useRealtimeKitSelector(() => participant.isSpeaking)
  const name = useRealtimeKitSelector(() => participant.name)

  useEffect(() => {
    const el = videoRef.current
    if (!el || !participant) return

    participant.registerVideoElement(el)
    return () => {
      participant.deregisterVideoElement(el)
    }
  }, [participant, videoTrack])

  const initial = (name ?? '?').charAt(0).toUpperCase()

  const gameStarted = useGameStore((s) => s.gameStarted)
  const mafiaIds = useGameStore((s) => s.mafiaIds)
  const mafiaMemberRoles = useGameStore((s) => s.mafiaMemberRoles)
  const myRoleCode = useGameStore((s) => s.myRoleCode)
  const currentVotes = useGameStore((s) => s.currentVotes)
  const alivePlayerIds = useGameStore((s) => s.alivePlayerIds)
  const lynchTargetId = useGameStore((s) => s.lynchTargetId)
  const requiredActions = useGameStore((s) => s.requiredActions)
  const castVote = useGameStore((s) => s.castVote)
  const killPlayer = useGameStore((s) => s.killPlayer)
  const healPlayer = useGameStore((s) => s.healPlayer)
  const detectPlayer = useGameStore((s) => s.detectPlayer)
  const shootPlayer = useGameStore((s) => s.shootPlayer)
  const revengeKill = useGameStore((s) => s.revengeKill)
  const roleblockPlayer = useGameStore((s) => s.roleblockPlayer)

  const myRoleType = myRoleCode
    ? ROLE_REGISTRY[myRoleCode]?.role_type
    : undefined
  const isMafia = myRoleType === Team.MAFIA
  const tileUserId: number | null =
    participant.customParticipantId != null
      ? Number(participant.customParticipantId)
      : null
  const isAlive = tileUserId != null && alivePlayerIds.includes(tileUserId)

  const currentUser = useAuthStore((s) => s.user)
  const isLocal =
    tileUserId != null &&
    currentUser != null &&
    tileUserId === Number(currentUser.id)

  // Vote count for this tile
  const voteCount = useMemo(() => {
    if (!gameStarted || tileUserId == null) return 0
    return Array.from(currentVotes.values()).filter((id) => id === tileUserId)
      .length
  }, [gameStarted, tileUserId, currentVotes])

  const isLynchTarget =
    gameStarted && tileUserId != null && lynchTargetId === tileUserId

  const currentUserId = currentUser ? Number(currentUser.id) : null
  const myAlive =
    currentUserId != null && alivePlayerIds.includes(currentUserId)

  // ── Tile-level actions (targeted actions where this user is a valid target) ──
  const tileActions = useMemo(() => {
    if (!gameStarted || !isAlive || !myAlive || isLocal || tileUserId == null) {
      console.log('[TileActions] skipped', {
        gameStarted,
        isAlive,
        myAlive,
        isLocal,
        tileUserId,
      })
      return []
    }
    const result: { actionType: string; visual: ActionVisual }[] = []
    for (const a of requiredActions) {
      if (
        a.action_type === ActionType.SILENT ||
        !a.target_options.includes(tileUserId)
      )
        continue
      const visual = ACTION_VISUAL[a.action_type]
      if (visual) result.push({ actionType: a.action_type, visual })
    }
    console.log('[TileActions] computed', {
      tileUserId,
      requiredActions,
      result: result.map((r) => r.actionType),
    })
    return result
  }, [gameStarted, isAlive, myAlive, isLocal, tileUserId, requiredActions])

  // ── Action handler ──
  const handleTileAction = (actionType: string) => {
    console.log('[TileAction] handleTileAction called', {
      actionType,
      tileUserId,
    })
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
      case ActionType.ROLEBLOCK:
        roleblockPlayer(tileUserId)
        break
    }
  }

  // ---- Ring / border ----
  let ringClass = ''
  const ringStyle: React.CSSProperties = {}

  if (gameStarted && !isAlive) {
    ringStyle.borderColor = 'rgba(243, 240, 232, 0.04)'
    ringClass = 'ring-1'
  } else if (isSelected) {
    ringStyle.borderColor = 'rgba(237, 184, 58, 0.6)'
    ringClass = 'ring-2'
  } else if (isLynchTarget) {
    ringStyle.boxShadow =
      '0 0 20px rgba(240, 96, 107, 0.4), inset 0 0 12px rgba(240, 96, 107, 0.08)'
    ringStyle.borderColor = 'rgba(240, 96, 107, 0.55)'
    ringClass = 'ring-2'
  } else if (isSelectable) {
    ringStyle.borderColor = 'rgba(243, 240, 232, 0.2)'
    ringClass = 'ring-1 hover:ring-white/40 cursor-pointer'
  } else if (
    gameStarted &&
    isMafia &&
    tileUserId != null &&
    mafiaIds.includes(tileUserId)
  ) {
    ringStyle.boxShadow = '0 0 12px rgba(240, 96, 107, 0.25)'
    ringStyle.borderColor = 'rgba(240, 96, 107, 0.3)'
    ringClass = 'ring-1 mafia-glow'
  } else if (gameStarted && isMafia && tileUserId != null && !isLocal) {
    ringStyle.borderColor = 'rgba(240, 96, 107, 0.18)'
    ringClass = 'ring-1'
  } else {
    ringStyle.borderColor = 'rgba(243, 240, 232, 0.08)'
    ringClass = 'ring-1'
  }

  // Speaking glow
  if (isSpeaking && isAlive !== false) {
    ringStyle.boxShadow = '0 0 20px rgba(143, 160, 245, 0.45)'
    ringStyle.borderColor = 'rgba(143, 160, 245, 0.55)'
    ringClass = 'ring-2'
  }

  // ---- Role icon (top-left) ----
  let roleIcon: React.ReactNode = null
  if (gameStarted) {
    if (isLocal && myRoleCode) {
      const roleDef = ROLE_REGISTRY[myRoleCode]
      const Icon = roleDef ? (ROLE_ICON_MAP[roleDef.icon] ?? User) : User
      roleIcon = <Icon className="h-3.5 w-3.5" />
    } else if (isMafia && tileUserId != null) {
      const roleCode = mafiaMemberRoles[tileUserId]
      if (roleCode) {
        const roleDef = ROLE_REGISTRY[roleCode]
        const Icon = roleDef ? (ROLE_ICON_MAP[roleDef.icon] ?? User) : User
        roleIcon = <Icon className="h-3.5 w-3.5" />
      }
    }
  }

  const handleClick = () => {
    if (isSelectable && tileUserId != null) {
      onSelect(tileUserId)
    }
  }

  const orbBase =
    'relative flex items-center justify-center h-9 w-9 rounded-xl border transition-all duration-200 cursor-pointer'

  return (
    <div
      className={`group relative w-full h-full rounded-lg overflow-hidden transition-all duration-200 ${ringClass}`}
      onClick={handleClick}
      style={ringStyle}
    >
      {videoEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover pointer-events-none"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ background: 'linear-gradient(145deg, #2D2A38, #242130)' }}
        >
          <div
            className="h-20 w-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(243, 240, 232, 0.04)' }}
          >
            <span
              className="text-4xl font-semibold select-none"
              style={{ color: 'var(--game-text-primary)', opacity: 0.55 }}
            >
              {initial}
            </span>
          </div>
        </div>
      )}

      {/* ── Action overlay: shown on hover ── */}
      {tileActions.length > 0 && (
        <div
          className="absolute inset-0 z-25 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ backgroundColor: 'rgba(27, 25, 34, 0.7)' }}
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
                backgroundColor: visual.glow.replace('0.3', '0.12'),
                borderColor: visual.glow.replace('0.3', '0.35'),
              }}
            >
              <visual.Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      )}

      {/* Lynch target overlay */}
      {isLynchTarget && !isSelected && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: 'rgba(240, 96, 107, 0.08)' }}
        />
      )}

      {/* Dead overlay */}
      {gameStarted && !isAlive && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ backgroundColor: 'rgba(27, 25, 34, 0.8)' }}
        >
          <div className="flex flex-col items-center gap-2">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(240, 96, 107, 0.18)' }}
            >
              <Skull
                className="h-5 w-5"
                style={{ color: 'var(--game-crimson)' }}
              />
            </div>
            <span
              className="text-xs font-bold tracking-wider uppercase"
              style={{ color: 'var(--game-crimson)' }}
            >
              Eliminated
            </span>
          </div>
        </div>
      )}

      {/* Bottom gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

      {/* Name tag */}
      <div className="absolute bottom-3 left-3 z-20">
        <RtkNameTag participant={participant}>
          <RtkAudioVisualizer />
        </RtkNameTag>
      </div>

      {/* Vote count badge (bottom-right) */}
      {gameStarted && voteCount > 0 && (
        <div
          className="absolute bottom-3 right-3 z-20 flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold border"
          style={{
            backgroundColor: 'rgba(237, 184, 58, 0.15)',
            borderColor: 'rgba(237, 184, 58, 0.35)',
            color: 'var(--game-gold)',
          }}
        >
          <Vote className="h-3 w-3" />
          <span>{voteCount}</span>
        </div>
      )}

      {/* Role icon (top-left) */}
      {roleIcon && (
        <div
          className="absolute top-3 left-3 z-20 w-6 h-6 rounded-md flex items-center justify-center border"
          style={{
            backgroundColor: 'rgba(27, 25, 34, 0.75)',
            borderColor: 'var(--game-border)',
            color: 'var(--game-text-primary)',
          }}
        >
          {roleIcon}
        </div>
      )}

      {/* Local indicator */}
      {isLocal && !videoEnabled && !gameStarted && (
        <div
          className="absolute top-3 right-3 z-20 px-2 py-0.5 rounded-md text-xs font-semibold"
          style={{
            backgroundColor: 'var(--game-bg-elevated)',
            color: 'var(--game-text-primary)',
          }}
        >
          You
        </div>
      )}
    </div>
  )
}
