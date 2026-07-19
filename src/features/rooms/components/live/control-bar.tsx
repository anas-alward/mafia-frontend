import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { RtkStageToggle } from '@cloudflare/realtimekit-react-ui'
import { useRealtimeKitMeeting, useRealtimeKitSelector } from '@cloudflare/realtimekit-react'
import { Users, PhoneOff, Mic, MicOff, Video, VideoOff, Maximize, Minimize, WifiOff } from 'lucide-react'
import { useRoomContext } from '#/features/rooms/context/room-context'
import { useSidebar } from '#/components/ui/sidebar'

interface ControlBarProps {
  fullScreenRef: React.RefObject<HTMLDivElement | null>
}

export default function ControlBar({ fullScreenRef }: ControlBarProps) {
  const { meeting } = useRealtimeKitMeeting()
  const audioEnabled = useRealtimeKitSelector(() => meeting.self.audioEnabled)
  const videoEnabled = useRealtimeKitSelector(() => meeting.self.videoEnabled)
  const navigate = useNavigate()
  const ctx = useRoomContext()
  const { wsState, sendError, joinRequests } = ctx
  const count = joinRequests.length
  const { toggleSidebar, open } = useSidebar()

  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      fullScreenRef.current?.requestFullscreen()
    }
  }, [fullScreenRef])

  return (
    <div
      className="shrink-0 z-50 flex flex-col border-t border-white/5"
      style={{ backgroundColor: '#161618' }}
    >
      {/* Connection error banner */}
      {((wsState === 'closed' || wsState === 'error') || sendError) && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border-b border-red-500/20 text-red-400 text-sm">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>{sendError || 'Connection lost. Check your network.'}</span>
        </div>
      )}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: fullscreen */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-3 rounded-full bg-white/5 text-[#f4f4f5] hover:bg-white/10 transition-colors"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>
        </div>

        {/* Center: media controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (audioEnabled) {
                meeting.self.disableAudio()
              } else {
                meeting.self.enableAudio()
              }
            }}
            className={`p-3 rounded-full transition-colors ${
              audioEnabled
                ? 'bg-white/5 text-[#f4f4f5] hover:bg-white/10'
                : 'bg-red-500/10 text-[#ef4444] hover:bg-red-500/20'
            }`}
            aria-label={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={() => {
              if (videoEnabled) {
                meeting.self.disableVideo()
              } else {
                meeting.self.enableVideo()
              }
            }}
            className={`p-3 rounded-full transition-colors ${
              videoEnabled
                ? 'bg-white/5 text-[#f4f4f5] hover:bg-white/10'
                : 'bg-red-500/10 text-[#ef4444] hover:bg-red-500/20'
            }`}
            aria-label={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>
          <RtkStageToggle />
          <button
            type="button"
            onClick={async () => {
              await meeting.leave()
              navigate({ to: '/' })
            }}
            className="p-3 rounded-full bg-red-600 hover:bg-red-500 text-white transition-colors"
            aria-label="Leave meeting"
          >
            <PhoneOff className="h-5 w-5" />
          </button>
        </div>

        {/* Right: join requests sidebar toggle */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={toggleSidebar}
            className={`relative flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              open
                ? 'text-[#f4f4f5] bg-white/10'
                : 'text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-white/5'
            }`}
            aria-label="Toggle join requests"
          >
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium hidden sm:inline">Requests</span>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white w-4 h-4 flex items-center justify-center rounded-full leading-none">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
