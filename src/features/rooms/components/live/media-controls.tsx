import { useLocalParticipant, useRoomContext } from '@livekit/components-react'
import { Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useMicBlocked } from '#/features/rooms/hooks/use-mic-blocked'

export function MediaControls() {
  const { t } = useTranslation()
  const {
    localParticipant,
    isMicrophoneEnabled: audioEnabled,
    isCameraEnabled: videoEnabled,
  } = useLocalParticipant()
  const room = useRoomContext()
  const micBlocked = useMicBlocked(room)

  return (
    <div className="flex items-center gap-2">
      {/* Mic */}
      <button
        type="button"
        onClick={() => localParticipant.setMicrophoneEnabled(!audioEnabled)}
        disabled={micBlocked}
        title={micBlocked ? t('room.media.silenced') : undefined}
        className={`p-2.5 rounded-xl transition-all duration-200 border ${
          micBlocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
        }`}
        style={{
          color: micBlocked
            ? 'var(--game-crimson)'
            : audioEnabled
              ? 'var(--game-text-primary)'
              : 'var(--game-crimson)',
          backgroundColor:
            audioEnabled && !micBlocked
              ? 'var(--game-bg-elevated)'
              : 'rgba(240, 96, 107, 0.12)',
          borderColor: micBlocked
            ? 'rgba(240, 96, 107, 0.35)'
            : audioEnabled
              ? 'var(--game-border)'
              : 'rgba(240, 96, 107, 0.25)',
        }}
        aria-label={
          micBlocked
            ? t('room.media.silenced')
            : audioEnabled
              ? t('room.media.muteMic')
              : t('room.media.unmuteMic')
        }
      >
        {audioEnabled && !micBlocked ? (
          <Mic className="h-4 w-4" />
        ) : (
          <MicOff className="h-4 w-4" />
        )}
      </button>

      {/* Camera */}
      <button
        type="button"
        onClick={() => localParticipant.setCameraEnabled(!videoEnabled)}
        className="p-2.5 rounded-xl transition-all duration-200 cursor-pointer border"
        style={{
          color: videoEnabled
            ? 'var(--game-text-primary)'
            : 'var(--game-crimson)',
          backgroundColor: videoEnabled
            ? 'var(--game-bg-elevated)'
            : 'rgba(240, 96, 107, 0.12)',
          borderColor: videoEnabled
            ? 'var(--game-border)'
            : 'rgba(240, 96, 107, 0.25)',
        }}
        aria-label={
          videoEnabled ? t('room.media.cameraOff') : t('room.media.cameraOn')
        }
      >
        {videoEnabled ? (
          <Video className="h-4 w-4" />
        ) : (
          <VideoOff className="h-4 w-4" />
        )}
      </button>

      {/* Leave */}
      <button
        type="button"
        onClick={async () => {
          await room.disconnect()
        }}
        className="p-2.5 rounded-xl transition-all duration-200 cursor-pointer border"
        style={{
          color: '#fff',
          backgroundColor: 'var(--game-crimson)',
          borderColor: 'var(--game-crimson)',
        }}
        aria-label={t('room.media.leave')}
      >
        <PhoneOff className="h-4 w-4" />
      </button>
    </div>
  )
}
