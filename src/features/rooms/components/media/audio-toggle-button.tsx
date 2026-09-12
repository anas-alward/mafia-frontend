import { Mic, MicOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useMediaConfigStore } from '#/features/rooms/store/media-config-store'

export function AudioToggleButton() {
  const { t } = useTranslation()
  const audioEnabled = useMediaConfigStore((s) => s.audioEnabled)
  const toggleAudio = useMediaConfigStore((s) => s.toggleAudio)
  const mediaError = useMediaConfigStore((s) => s.mediaError)

  return (
    <button
      type="button"
      onClick={toggleAudio}
      disabled={!!mediaError}
      aria-label={
        audioEnabled ? t('room.join.turnOffMic') : t('room.join.turnOnMic')
      }
      className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
        audioEnabled
          ? 'bg-[#60a5fa] text-white hover:bg-[#3b82f6]'
          : 'bg-[#212124] text-[#ef4444] hover:bg-[#2a2a2e] ring-1 ring-white/5'
      } disabled:opacity-40`}
    >
      {audioEnabled ? (
        <Mic className="h-5 w-5" />
      ) : (
        <MicOff className="h-5 w-5" />
      )}
    </button>
  )
}
