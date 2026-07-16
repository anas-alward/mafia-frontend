import { useEffect, useRef } from 'react'
import { useRealtimeKitSelector } from '@cloudflare/realtimekit-react'
import {
  RtkAudioVisualizer,
  RtkNameTag,
} from '@cloudflare/realtimekit-react-ui'

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

  return (
    <div
      className={`group relative w-full h-full rounded-xs overflow-hidden shadow-lg transition-all duration-200 ${
        isSpeaking
          ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-neutral-900'
          : 'ring-1 ring-neutral-700/50 hover:ring-neutral-500'
      }`}
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
        <div className="w-full h-full bg-gradient-to-b from-neutral-700 to-neutral-800 flex items-center justify-center">
          <div className="h-20 w-20 rounded-full bg-neutral-600/50 flex items-center justify-center">
            <span className="text-4xl font-semibold text-neutral-200 select-none">
              {initial}
            </span>
          </div>
        </div>
      )}

      {/* Bottom gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />

      {/* Name tag */}
      <div className="absolute bottom-3 left-3">
        <RtkNameTag participant={participant}>
          <RtkAudioVisualizer />
        </RtkNameTag>
      </div>

      {/* Muted indicator */}
      {isLocal && !videoEnabled && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-neutral-900/80 text-xs text-neutral-400">
          You
        </div>
      )}
    </div>
  )
}
