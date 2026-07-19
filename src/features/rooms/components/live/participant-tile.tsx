import { useEffect, useRef, useMemo } from 'react'
import { useRealtimeKitSelector } from '@cloudflare/realtimekit-react'
import {
  RtkAudioVisualizer,
  RtkNameTag,
} from '@cloudflare/realtimekit-react-ui'
import { Eye, Skull, Crosshair, Stethoscope, User, Vote } from 'lucide-react'
import { useGameContext } from '#/features/game/context/game-context'

const ROLE_ICONS: Record<string, typeof Eye> = {
  mafia: Skull,
  gunner: Crosshair,
  doctor: Stethoscope,
  cop: Eye,
}

interface CustomParticipantTileProps {
  participant: any
  isSelected: boolean
  isSelectable: boolean
  onSelect: (userId: number) => void
}

export default function CustomParticipantTile({
  participant,
  isSelected,
  isSelectable,
  onSelect,
}: CustomParticipantTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoEnabled = useRealtimeKitSelector(() => participant.videoEnabled)
  const videoTrack = useRealtimeKitSelector(() => participant.videoTrack)
  const isSpeaking = useRealtimeKitSelector(() => participant.isSpeaking)
  const isLocal = useRealtimeKitSelector(() => participant.isLocal)
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

  const {
    gameStarted,
    myRoleType,
    mafiaIds,
    myRole,
    currentVotes,
  } = useGameContext()

  const isMafia = myRoleType === 'mafia'
  const tileUserId = participant.customParticipantId

  // Vote count for this tile
  const voteCount = useMemo(() => {
    if (!gameStarted || tileUserId == null) return 0
    const numId = Number(tileUserId)
    return Array.from(currentVotes.values()).filter((id) => id === numId).length
  }, [gameStarted, tileUserId, currentVotes])

  // ---- Ring / border ----
  let ringClass = 'ring-1 ring-white/5'
  if (isSpeaking) {
    ringClass = 'ring-2 ring-[#60a5fa] ring-offset-1 ring-offset-[#161618]'
  } else if (isSelected) {
    ringClass = 'ring-2 ring-amber-500 ring-offset-1 ring-offset-[#161618]'
  } else if (isSelectable) {
    ringClass = 'ring-1 ring-white/20 hover:ring-white/40 cursor-pointer'
  } else if (gameStarted && isMafia) {
    if (tileUserId != null && mafiaIds.has(Number(tileUserId))) {
      ringClass = 'ring-1 ring-gray-700'
    } else if (tileUserId != null && !isLocal) {
      ringClass = 'ring-1 ring-red-500/40'
    }
  }

  // ---- Role icon (top-left) ----
  let roleIcon: React.ReactNode = null
  if (gameStarted) {
    if (isLocal && myRole) {
      const Icon = ROLE_ICONS[myRoleType ?? ''] ?? User
      roleIcon = <Icon className="h-3.5 w-3.5" />
    } else if (isMafia) {
      if (tileUserId != null && mafiaIds.has(Number(tileUserId))) {
        roleIcon = <Skull className="h-3.5 w-3.5" />
      }
    }
  }

  const handleClick = () => {
    if (isSelectable && tileUserId != null) {
      onSelect(Number(tileUserId))
    }
  }

  return (
    <div
      className={`group relative w-full h-full rounded-lg overflow-hidden transition-all duration-200 ${ringClass}`}
      onClick={handleClick}
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
        <div className="w-full h-full bg-gradient-to-b from-[#212124] to-[#161618] flex items-center justify-center">
          <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center">
            <span className="text-4xl font-semibold text-[#a1a1aa] select-none">
              {initial}
            </span>
          </div>
        </div>
      )}

      {/* Selection overlay */}
      {isSelected && (
        <div className="absolute inset-0 bg-amber-500/10 pointer-events-none" />
      )}

      {/* Bottom gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

      {/* Name tag */}
      <div className="absolute bottom-3 left-3 z-20">
        <RtkNameTag participant={participant}>
          <RtkAudioVisualizer />
        </RtkNameTag>
      </div>

      {/* Vote count badge (bottom-right) */}
      {gameStarted && voteCount > 0 && (
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-medium">
          <Vote className="h-3 w-3" />
          <span>{voteCount}</span>
        </div>
      )}

      {/* Role icon (top-left) */}
      {roleIcon && (
        <div className="absolute top-3 left-3 z-20 w-6 h-6 rounded-md bg-black/60 border border-white/10 flex items-center justify-center text-[#f4f4f5]">
          {roleIcon}
        </div>
      )}

      {/* Local indicator */}
      {isLocal && !videoEnabled && !gameStarted && (
        <div className="absolute top-3 right-3 z-20 px-2 py-0.5 rounded-md bg-black/40 text-xs text-[#a1a1aa]">
          You
        </div>
      )}
    </div>
  )
}
