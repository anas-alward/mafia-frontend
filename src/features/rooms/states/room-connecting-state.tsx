import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Loader2, Video } from 'lucide-react'

interface RoomConnectingStateProps {
  roomId: string
}

export function RoomConnectingState({ roomId }: RoomConnectingStateProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#161618]">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate({ to: '/' })}
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Card */}
      <div className="bg-[#212124] border border-white/5 rounded-2xl px-10 py-10 text-center space-y-6 max-w-sm w-full shadow-2xl">
        {/* Icon */}
        <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto">
          <Video className="h-8 w-8 text-[#60a5fa]" />
        </div>

        {/* Room code */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-[#f4f4f5]">Connecting to meeting</h2>
          <span className="inline-block font-mono text-sm text-[#a1a1aa] bg-[#161618] px-4 py-1.5 rounded-lg">
            #{roomId}
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center justify-center gap-2.5 text-[#a1a1aa]">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Establishing connection</span>
        </div>

        {/* Animated dots */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#60a5fa] animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-[#60a5fa] animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-[#60a5fa] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}
