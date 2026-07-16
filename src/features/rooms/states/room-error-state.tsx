import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, AlertTriangle, Wifi } from 'lucide-react'

interface RoomErrorStateProps {
  onReconnect: () => void
}

export function RoomErrorState({ onReconnect }: RoomErrorStateProps) {
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
        <div className="h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-[#f4f4f5]">Connection error</h2>
          <p className="text-sm text-[#a1a1aa]">Could not connect to the meeting server.</p>
        </div>
        <button
          type="button"
          onClick={onReconnect}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 text-[#f4f4f5] hover:bg-white/10 transition-colors text-sm font-medium"
        >
          <Wifi className="h-4 w-4" />
          Retry
        </button>
      </div>
    </div>
  )
}
