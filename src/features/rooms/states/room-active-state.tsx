import { useState, useEffect, useCallback, useRef } from 'react'
import { useRealtimeKitMeeting, useRealtimeKitSelector } from '@cloudflare/realtimekit-react'
import { RtkStage } from '@cloudflare/realtimekit-react-ui'
import { Users, Copy, Check } from 'lucide-react'
import TilesGrid from '#/features/rooms/components/live/tiles-grid.tsx'
import ControlBar from '#/features/rooms/components/live/control-bar.tsx'

interface RoomActiveStateProps {
  fullScreenRef: React.RefObject<HTMLDivElement | null>
  roomId: string
}

export function RoomActiveState({ fullScreenRef, roomId }: RoomActiveStateProps) {
  const { meeting } = useRealtimeKitMeeting()
  const participantCount = useRealtimeKitSelector(
    () => meeting.participants.joined.size + 1,
  )

  const [copied, setCopied] = useState(false)
  const copyRoomCode = useCallback(async () => {
    await navigator.clipboard.writeText(roomId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [roomId])

  const [topBarVisible, setTopBarVisible] = useState(false)
  const topTimerRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (e.clientY < 80) {
        setTopBarVisible(true)
        if (topTimerRef.current) {
          clearTimeout(topTimerRef.current)
          topTimerRef.current = null
        }
      } else {
        if (!topTimerRef.current) {
          topTimerRef.current = setTimeout(() => setTopBarVisible(false), 600)
        }
      }
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      if (topTimerRef.current) clearTimeout(topTimerRef.current)
    }
  }, [])

  return (
    <div className="relative flex flex-col h-full w-full bg-[#161618]">
      {/* Top bar */}
      <div
        className={`absolute top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-6 transition-opacity duration-300 ${
          topBarVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          background: 'linear-gradient(to bottom, rgba(22,22,24,0.95), transparent)',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-base font-medium text-[#a1a1aa]">Room</span>
          <button
            type="button"
            onClick={copyRoomCode}
            className="group flex items-center gap-2 text-base font-mono text-[#f4f4f5] bg-[#212124] hover:bg-[#2a2a2e] px-3 py-1 rounded-md transition-colors cursor-pointer"
          >
            #{roomId}
            {copied ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Copy className="h-4 w-4 text-[#71717a] opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </button>
        </div>
        <div className="flex items-center gap-2 text-[#a1a1aa] text-base">
          <Users className="h-5 w-5" />
          <span>
            {participantCount} {participantCount === 1 ? 'person' : 'people'}
          </span>
        </div>
      </div>

      {/* Stage — wrapped in a plain div so flex constraints are enforced */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <RtkStage
          style={{
            position: 'absolute',
            inset: 0,
          }}
        >
          <TilesGrid />
        </RtkStage>
      </div>

      <ControlBar fullScreenRef={fullScreenRef} />
    </div>
  )
}
