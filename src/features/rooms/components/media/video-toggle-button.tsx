import { Video, VideoOff } from 'lucide-react'
import { useMediaConfigStore } from '#/features/rooms/store/media-config-store'

export function VideoToggleButton() {
  const videoEnabled = useMediaConfigStore((s) => s.videoEnabled)
  const toggleVideo = useMediaConfigStore((s) => s.toggleVideo)
  const mediaError = useMediaConfigStore((s) => s.mediaError)

  return (
    <button
      type="button"
      onClick={toggleVideo}
      disabled={!!mediaError}
      className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
        videoEnabled
          ? 'bg-[#60a5fa] text-white hover:bg-[#3b82f6]'
          : 'bg-[#212124] text-[#ef4444] hover:bg-[#2a2a2e] ring-1 ring-white/5'
      } disabled:opacity-40`}
    >
      {videoEnabled ? (
        <Video className="h-5 w-5" />
      ) : (
        <VideoOff className="h-5 w-5" />
      )}
    </button>
  )
}
