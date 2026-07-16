import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Loader2, Video } from 'lucide-react'

interface RoomWaitingStateProps {
  roomId: string
}

export function RoomWaitingState({ roomId }: RoomWaitingStateProps) {
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
        <div className="relative mx-auto h-16 w-16">
          <div className="absolute inset-0 rounded-2xl bg-blue-500/10 animate-pulse" />
          <div className="relative h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <Video className="h-8 w-8 text-[#60a5fa]" />
          </div>
        </div>

        {/* Room code */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-[#f4f4f5]">Joining meeting</h2>
          <span className="inline-block font-mono text-sm text-[#60a5fa] bg-[#161618] px-4 py-1.5 rounded-lg">
            #{roomId}
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center justify-center gap-2.5 text-[#a1a1aa]">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Waiting for host to start the meeting</span>
        </div>
      </div>
    </div>
  )
}
