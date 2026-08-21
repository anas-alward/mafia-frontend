import { useEffect, useRef } from 'react'
import { useRealtimeKitSelector } from '@cloudflare/realtimekit-react'
import {
  RtkAudioVisualizer,
  RtkNameTag,
} from '@cloudflare/realtimekit-react-ui'
import { useGameStore } from '#/features/game/store/game-store'
import { useAuthStore } from '#/features/auth/store/auth-store'
import { ROLE_REGISTRY, Team } from '#/features/game/constants'
import { TileRoleBadge } from '#/features/game/components/tile-role-badge'
import { VoteCountBadge } from '#/features/game/components/vote-count-badge'

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
  const myRoleCode = useGameStore((s) => s.myRoleCode)
  const alivePlayerIds = useGameStore((s) => s.alivePlayerIds)

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

  const TILE_COLORS = [
    '#2D2A38', '#2A352E', '#2E3038', '#352E2A',
    '#2A3038', '#332C36', '#2C3230', '#36302C',
    '#28302E', '#312A33', '#2E312A', '#342D30',
    '#2B3035', '#302F28', '#2D2E36', '#332B2E',
    '#29322C', '#362E32', '#2C2F34', '#312D2A',
    '#2A2E35', '#2F2C32', '#2E332D', '#342A2E',
  ]

  // Deterministic via Knuth multiplicative hash — avoids same-color
  // collisions across the small set of participants in a room.
  const tileColor = (() => {
    if (tileUserId == null) return TILE_COLORS[0]
    const hash = ((tileUserId * 2654435761) >>> 0) % TILE_COLORS.length
    return TILE_COLORS[hash]
  })()

  // ---- Ring / border ----
  let ringClass = ''
  const ringStyle: React.CSSProperties = {}

  if (gameStarted && !isAlive) {
    ringStyle.borderColor = 'rgba(243, 240, 232, 0.04)'
    ringClass = 'ring-1'
  } else if (isSelected) {
    ringStyle.borderColor = 'rgba(237, 184, 58, 0.6)'
    ringClass = 'ring-2'
  } else if (isSelectable) {
    ringStyle.borderColor = 'rgba(243, 240, 232, 0.2)'
    ringClass = 'ring-1 hover:ring-white/40 cursor-pointer'
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

  const handleClick = () => {
    if (isSelectable && tileUserId != null) {
      onSelect(tileUserId)
    }
  }

  return (
    <div
      className={`relative w-full h-full rounded-lg overflow-hidden transition-all duration-200 ${ringClass}`}
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
          style={{ backgroundColor: tileColor }}
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

      {/* Name tag */}
      <div className="absolute bottom-3 left-3 z-20">
        <RtkNameTag participant={participant}>
          <RtkAudioVisualizer />
        </RtkNameTag>
      </div>

      {/* Vote count badge (bottom-right) */}
      <VoteCountBadge userId={tileUserId} />

      {/* Role icon (top-left) */}
      <TileRoleBadge userId={tileUserId} isLocal={isLocal} isMafia={isMafia} />

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
