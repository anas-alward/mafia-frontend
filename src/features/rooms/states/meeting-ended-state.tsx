import { useNavigate } from '@tanstack/react-router'
import { Video } from 'lucide-react'

export function MeetingEndedState() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#161618]">
      <div className="bg-[#212124] border border-white/5 rounded-2xl px-10 py-10 text-center space-y-6 max-w-sm w-full shadow-2xl">
        <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto">
          <Video className="h-8 w-8 text-amber-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-[#f4f4f5]">Meeting ended</h2>
          <p className="text-sm text-[#a1a1aa]">Thanks for joining.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate({ to: '/' })}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 text-[#f4f4f5] hover:bg-white/10 transition-colors text-sm font-medium"
        >
          Back to rooms
        </button>
      </div>
    </div>
  )
}
