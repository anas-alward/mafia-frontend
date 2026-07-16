import { useRealtimeKitMeeting, useRealtimeKitSelector } from '@cloudflare/realtimekit-react'
import { Loader2 } from 'lucide-react'

export function MeetingWaitingState() {
  const { meeting } = useRealtimeKitMeeting()
  const name = useRealtimeKitSelector(() => meeting.self.name)

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#161618]">
      <div className="bg-[#212124] border border-white/5 rounded-2xl px-10 py-10 text-center space-y-6 max-w-sm w-full shadow-2xl">
        {/* Avatar */}
        <div className="h-20 w-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto">
          <span className="text-3xl font-semibold text-[#60a5fa] select-none">
            {(name || '?').charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-[#f4f4f5]">Waiting to join</h2>
          <p className="text-sm text-[#a1a1aa]">
            The host will let you in shortly
          </p>
        </div>

        {/* Spinner */}
        <div className="flex items-center justify-center gap-2.5 text-[#a1a1aa]">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">In the waiting room</span>
        </div>
      </div>
    </div>
  )
}
