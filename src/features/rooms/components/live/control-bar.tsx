import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  RtkFullscreenToggle,
  RtkMicToggle,
  RtkCameraToggle,
  RtkStageToggle,
} from '@cloudflare/realtimekit-react-ui'
import { useRealtimeKitMeeting } from '@cloudflare/realtimekit-react'
import { Users, Check, X, PhoneOff } from 'lucide-react'
import { useJoinRequests } from '#/features/rooms/hooks/use-join-requests'
import { useRoomContext } from '#/features/rooms/context/room-context'

interface ControlBarProps {
  fullScreenRef: React.RefObject<HTMLDivElement | null>
}

export default function ControlBar({ fullScreenRef }: ControlBarProps) {
  const { meeting } = useRealtimeKitMeeting()
  const navigate = useNavigate()
  const ctx = useRoomContext()
  const { joinRequests, acceptJoinRequest, rejectJoinRequest } = useJoinRequests({
    joinRequests: ctx.joinRequests,
    dismissJoinRequest: ctx.dismissJoinRequest,
    acceptJoinRequest: ctx.acceptJoinRequest,
    rejectJoinRequest: ctx.rejectJoinRequest,
  })
  const count = joinRequests?.length ?? 0

  const [tooltipOpen, setTooltipOpen] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Close tooltip on outside click
  useEffect(() => {
    if (!tooltipOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setTooltipOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [tooltipOpen])

  const toggleTooltip = useCallback(() => setTooltipOpen((p) => !p), [])

  return (
    <div
      className="shrink-0 z-50 flex items-center justify-between px-4 py-3 border-t border-white/5"
      style={{ backgroundColor: '#161618' }}
    >
      {/* Left: fullscreen */}
      <div className="flex items-center">
        <RtkFullscreenToggle targetElement={fullScreenRef.current} />
      </div>

      {/* Center: media controls */}
      <div className="flex items-center gap-3">
        <RtkMicToggle />
        <RtkCameraToggle />
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

      {/* Right: join requests + tooltip */}
      <div className="flex items-center relative" ref={tooltipRef}>
        <button
          type="button"
          onClick={toggleTooltip}
          className="relative flex items-center gap-2 px-3 py-2 rounded-lg text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-white/5 transition-colors"
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

        {/* Tooltip */}
        {tooltipOpen && (
          <div
            className="absolute bottom-full right-0 mb-2 w-72 bg-[#212124] border border-white/5 rounded-xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <Users className="h-4 w-4 text-[#a1a1aa]" />
              <h3 className="text-sm font-semibold text-[#f4f4f5]">
                Join Requests
              </h3>
              {count > 0 && (
                <span className="text-xs text-[#a1a1aa] bg-white/5 px-2 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="max-h-64 overflow-y-auto">
              {count === 0 ? (
                <p className="px-4 py-8 text-sm text-[#71717a] text-center">
                  No pending requests
                </p>
              ) : (
                <ul className="divide-y divide-white/5">
                  {joinRequests!.map((req) => (
                    <li
                      key={req.userId}
                      className="px-4 py-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                          <span className="text-sm font-medium text-[#a1a1aa]">
                            {req.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-[#f4f4f5] truncate">
                          {req.username}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => acceptJoinRequest(req.userId)}
                          className="p-1.5 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors"
                          aria-label={`Accept ${req.username}`}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => rejectJoinRequest(req.userId)}
                          className="p-1.5 rounded-lg bg-white/5 text-[#a1a1aa] hover:bg-white/10 hover:text-[#f4f4f5] transition-colors"
                          aria-label={`Reject ${req.username}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
