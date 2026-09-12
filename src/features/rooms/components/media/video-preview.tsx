import { useRef, useEffect } from 'react'
import { VideoOff, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useMediaConfigStore } from '#/features/rooms/store/media-config-store'

export function VideoPreview() {
  const { t } = useTranslation()
  const mediaStream = useMediaConfigStore((s) => s.mediaStream)
  const videoEnabled = useMediaConfigStore((s) => s.videoEnabled)
  const mediaReady = useMediaConfigStore((s) => s.mediaReady)
  const mediaError = useMediaConfigStore((s) => s.mediaError)

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el || !mediaStream) return
    el.srcObject = mediaStream
    return () => {
      el.srcObject = null
    }
  }, [mediaStream])

  return (
    <div className="relative bg-[#212124] rounded-xl overflow-hidden aspect-video ring-1 ring-white/5">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{
          visibility:
            mediaReady && videoEnabled && !mediaError ? 'visible' : 'hidden',
        }}
      />
      {!mediaReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#212124] to-[#161618]">
          <Loader2 className="h-8 w-8 animate-spin text-[#71717a]" />
        </div>
      )}
      {mediaReady && (!videoEnabled || mediaError) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#212124] to-[#161618]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
              <VideoOff className="h-6 w-6 text-[#71717a]" />
            </div>
            <span className="text-xs text-[#71717a]">
              {mediaError
                ? t('room.join.cameraUnavailable')
                : t('room.join.cameraOff')}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
