import { Loader2 } from 'lucide-react'

export function MeetingIdleState() {
  return (
    <div className="flex items-center justify-center h-full bg-[#161618]">
      <div className="flex items-center gap-3 text-[#a1a1aa]">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Preparing meeting</span>
      </div>
    </div>
  )
}
