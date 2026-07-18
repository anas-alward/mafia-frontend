import { useEffect, useRef } from 'react'
import { useRealtimeKitSelector } from '@cloudflare/realtimekit-react'
import {
  RtkAudioVisualizer,
  RtkNameTag,
} from '@cloudflare/realtimekit-react-ui'
import { Eye, Skull, Crosshair, Stethoscope, User } from 'lucide-react'
import { useGameContext } from '#/features/rooms/context/game-context'

const ROLE_ICONS: Record<string, typeof Eye> = {
  mafia: Skull,
  gunner: Crosshair,
  doctor: Stethoscope,
  cop: Eye,
}

interface CustomParticipantTileProps {
  participant: any
}

export default function CustomParticipantTile({ participant }: CustomParticipantTileProps) {
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

  const { gameStarted, myRoleType, mafiaIds, myRole } = useGameContext()
  const isMafia = myRoleType === 'mafia'

  let ringClass = 'ring-1 ring-white/5 hover:ring-white/10'
  if (isSpeaking) {
    ringClass = 'ring-2 ring-[#60a5fa] ring-offset-1 ring-offset-[#161618]'
  } else if (gameStarted && isMafia) {
    const tileUserId = participant.userId
    if (tileUserId != null && mafiaIds.has(tileUserId)) {
      ringClass = 'ring-1 ring-gray-700 hover:ring-gray-600'
    } else if (tileUserId != null && !isLocal) {
      ringClass = 'ring-1 ring-red-500/40 hover:ring-red-500/60'
    }
  }

  let roleIcon: React.ReactNode = null
  if (gameStarted) {
    if (isLocal && myRole) {
      const Icon = ROLE_ICONS[myRoleType ?? ''] ?? User
      roleIcon = <Icon className="h-3.5 w-3.5" />
    } else if (isMafia) {
      const tileUserId = participant.userId
      if (tileUserId != null && mafiaIds.has(tileUserId)) {
        roleIcon = <Skull className="h-3.5 w-3.5" />
      }
    }
  }

  return (
    <div
      className={`group relative w-full h-full rounded-lg overflow-hidden transition-all duration-200 ${ringClass}`}
    >
      {videoEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
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

      {/* Bottom gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

      {/* Name tag */}
      <div className="absolute bottom-3 left-3">
        <RtkNameTag participant={participant}>
          <RtkAudioVisualizer />
        </RtkNameTag>
      </div>

      {/* Role icon */}
      {roleIcon && (
        <div className="absolute top-3 left-3 w-6 h-6 rounded-md bg-black/60 border border-white/10 flex items-center justify-center text-[#f4f4f5]">
          {roleIcon}
        </div>
      )}

      {/* Local indicator */}
      {isLocal && !videoEnabled && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/40 text-xs text-[#a1a1aa]">
          You
        </div>
      )}
    </div>
  )
}
