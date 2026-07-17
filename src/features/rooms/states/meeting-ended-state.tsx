import { useNavigate } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'

export function MeetingEndedState() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#161618]">
      <div className="text-center space-y-6">
        <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto">
          <LogOut className="h-5 w-5 text-[#71717a]" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-[#f4f4f5]">Meeting ended</h2>
          <p className="text-sm text-[#71717a]">Thanks for joining.</p>
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
