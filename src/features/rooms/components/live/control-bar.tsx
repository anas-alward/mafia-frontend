import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { RtkStageToggle } from '@cloudflare/realtimekit-react-ui'
import { useRealtimeKitMeeting, useRealtimeKitSelector } from '@cloudflare/realtimekit-react'
import { Users, PhoneOff, Mic, MicOff, Video, VideoOff, Maximize, Minimize, WifiOff } from 'lucide-react'
import { useMeetingStore } from '#/features/rooms/store/meeting-store'
import { useSidebar } from '#/components/ui/sidebar'

interface ControlBarProps {
  fullScreenRef: React.RefObject<HTMLDivElement | null>
}

export default function ControlBar({ fullScreenRef }: ControlBarProps) {
  const { meeting } = useRealtimeKitMeeting()
  const audioEnabled = useRealtimeKitSelector(() => meeting.self.audioEnabled)
  const videoEnabled = useRealtimeKitSelector(() => meeting.self.videoEnabled)
  const navigate = useNavigate()
  const wsState = useMeetingStore((s) => s.wsState)
  const sendError = useMeetingStore((s) => s.sendError)
  const joinRequests = useMeetingStore((s) => s.joinRequests)
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
    <div className="shrink-0 z-50 flex flex-col">
      {/* Connection error banner */}
      {((wsState === 'closed' || wsState === 'error') || sendError) && (
        <div
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium"
          style={{
            backgroundColor: 'rgba(240, 96, 107, 0.12)',
            borderBottom: '1px solid rgba(240, 96, 107, 0.2)',
            color: 'var(--game-crimson)',
          }}
        >
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          <span className="text-xs">{sendError || 'Connection lost. Check your network.'}</span>
        </div>
      )}

      {/* Main bar */}
      <div
        className="flex items-center justify-between h-14 px-5"
        style={{
          backgroundColor: 'var(--game-bg-deep)',

        }}
      >
        {/* Left: fullscreen */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl transition-all duration-200 cursor-pointer border border-transparent hover:bg-[var(--game-bg-elevated)]"
            style={{ color: 'var(--game-text-muted)' }}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
        </div>

        {/* Center: media controls */}
        <div className="flex items-center gap-2">
          {/* Mic */}
          <button
            type="button"
            onClick={() => audioEnabled ? meeting.self.disableAudio() : meeting.self.enableAudio()}
            className="p-2.5 rounded-xl transition-all duration-200 cursor-pointer border"
            style={{
              color: audioEnabled ? 'var(--game-text-primary)' : 'var(--game-crimson)',
              backgroundColor: audioEnabled ? 'var(--game-bg-elevated)' : 'rgba(240, 96, 107, 0.12)',
              borderColor: audioEnabled ? 'var(--game-border)' : 'rgba(240, 96, 107, 0.25)',
            }}
            aria-label={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          >
            {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </button>

          {/* Camera */}
          <button
            type="button"
            onClick={() => videoEnabled ? meeting.self.disableVideo() : meeting.self.enableVideo()}
            className="p-2.5 rounded-xl transition-all duration-200 cursor-pointer border"
            style={{
              color: videoEnabled ? 'var(--game-text-primary)' : 'var(--game-crimson)',
              backgroundColor: videoEnabled ? 'var(--game-bg-elevated)' : 'rgba(240, 96, 107, 0.12)',
              borderColor: videoEnabled ? 'var(--game-border)' : 'rgba(240, 96, 107, 0.25)',
            }}
            aria-label={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </button>

          <RtkStageToggle />

          {/* Leave */}
          <button
            type="button"
            onClick={async () => {
              await meeting.leave()
              navigate({ to: '/' })
            }}
            className="p-2.5 rounded-xl transition-all duration-200 cursor-pointer border"
            style={{
              color: '#fff',
              backgroundColor: 'var(--game-crimson)',
              borderColor: 'var(--game-crimson)',
            }}
            aria-label="Leave meeting"
          >
            <PhoneOff className="h-4 w-4" />
          </button>
        </div>

        {/* Right: join requests */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={toggleSidebar}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer border text-xs font-semibold"
            style={{
              color: open ? 'var(--game-text-primary)' : 'var(--game-text-muted)',
              backgroundColor: open ? 'var(--game-bg-elevated)' : 'transparent',
              borderColor: open ? 'var(--game-border)' : 'transparent',
            }}
            aria-label="Toggle join requests"
          >
            <Users className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Requests</span>
            {count > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 text-[10px] font-bold text-white min-w-[18px] h-[18px] flex items-center justify-center rounded-full leading-none px-1"
                style={{ backgroundColor: 'var(--game-crimson)' }}
              >
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
